import { BigNumberish, BytesLike } from 'ethers'
import { task } from 'hardhat/config'

import { addressToBytes32 } from '@layerzerolabs/lz-v2-utilities'

interface SendParam {
    dstEid: BigNumberish // Destination LayerZero EndpointV2 ID.
    to: BytesLike // Recipient address.
    tokenId: BigNumberish // Token ID of the NFT to send.
    extraOptions: BytesLike // Additional options supplied by the caller to be used in the LayerZero message.
    composeMsg: BytesLike // The composed message for the send() operation.
    onftCmd: BytesLike // The ONFT command to be executed, unused in default ONFT implementations.
}

task('send-nft', 'Sends an NFT from chain A to chain B using MyONFTAdapter')
    .addParam('dstEndpointId', 'Destination chain endpoint ID')
    .addParam('recipient', 'Recipient on the destination chain')
    .addParam('tokenId', 'Token ID to send')
    .setAction(async (taskArgs, { ethers, deployments }) => {
        const { dstEndpointId, recipient, tokenId } = taskArgs
        const [signer] = await ethers.getSigners()
        const onft = await deployments.get('MyONFT721Mock')

        // Get adapter contract instance
        const adapterContract = new ethers.Contract(onft.address, onft.abi, signer)

        // Get the underlying ERC721 token address
        const tokenAddress = await adapterContract.token()
        const erc721Contract = await ethers.getContractAt('IERC721', tokenAddress)

        // Check and set approval for specific token ID
        const approved = await erc721Contract.getApproved(tokenId)
        if (approved.toLowerCase() !== onft.address.toLowerCase()) {
            const approveTx = await erc721Contract.approve(onft.address, tokenId)
            await approveTx.wait() // Grant approval for specific token ID
        }

        // Build the parameters
        const sendParam: SendParam = {
            dstEid: dstEndpointId,
            to: addressToBytes32(recipient), // convert to bytes32
            tokenId: tokenId,
            extraOptions: '0x', // If you want to pass custom options
            composeMsg: '0x', // If you want additional logic on the remote chain
            onftCmd: '0x',
        }

        // Get quote for the transfer
        const quotedFee = await adapterContract.quoteSend(sendParam, false)

        // Send the NFT, using the returned quoted fee in msg.value
        const tx = await adapterContract.send(sendParam, quotedFee, signer.address, { value: quotedFee.nativeFee })

        const receipt = await tx.wait()
        console.log('🎉 NFT sent! Transaction hash:', receipt.transactionHash)
    })
