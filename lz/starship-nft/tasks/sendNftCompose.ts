import { BigNumberish, BytesLike } from 'ethers'
import { task } from 'hardhat/config'

import { Options, addressToBytes32 } from '@layerzerolabs/lz-v2-utilities'

interface SendParam {
    dstEid: BigNumberish // Destination LayerZero EndpointV2 ID.
    to: BytesLike // Recipient address.
    tokenId: BigNumberish // Token ID of the NFT to send.
    extraOptions: BytesLike // Additional options supplied by the caller to be used in the LayerZero message.
    composeMsg: BytesLike // The composed message for the send() operation.
    onftCmd: BytesLike // The ONFT command to be executed, unused in default ONFT implementations.
}

task('send-nft-compose', 'Sends an NFT from chain A to chain B using MyONFTAdapter')
    .addParam('dstEndpointId', 'Destination chain endpoint ID')
    .addParam('composerAddress', 'Composer address on dst chain')
    .addParam('tokenId', 'Token ID to send')
    .addParam('playerId', 'Player ID (1 or 2) for zone claiming')
    .setAction(async (taskArgs, { ethers, deployments }) => {
        const { dstEndpointId, composerAddress, tokenId, playerId } = taskArgs
        const [signer] = await ethers.getSigners()
        const onft = await deployments.get('MyONFT721Mock')

        // Validate player ID
        if (playerId !== '1' && playerId !== '2') {
            throw new Error('Player ID must be 1 or 2')
        }

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

        // Options.newOptions().addExecutorLzReceiveOption(50000, 0).addExecutorLzComposeOption(0, 30000, 0);
        const options = Options.newOptions()
            .addExecutorLzReceiveOption(300000, 0)
            .addExecutorComposeOption(0, 200_000, 1)
            .toBytes()

        // Build the compose message: abi.encode(playerId)
        // This matches what MyONFT721ComposerMock.lzCompose expects
        const composeMsg = ethers.utils.defaultAbiCoder.encode(['uint8'], [parseInt(playerId)])

        // Build the parameters
        const sendParam: SendParam = {
            dstEid: dstEndpointId,
            to: addressToBytes32(composerAddress), // convert to bytes32
            tokenId: tokenId,
            extraOptions: options, // If you want to pass custom options
            composeMsg: composeMsg, // If you want additional logic on the remote chain
            onftCmd: '0x',
        }

        // Get quote for the transfer
        const quotedFee = await adapterContract.quoteSend(sendParam, false)

        // Send the NFT, using the returned quoted fee in msg.value
        const tx = await adapterContract.send(sendParam, quotedFee, signer.address, { value: quotedFee.nativeFee })

        const receipt = await tx.wait()
        console.log('🎉 NFT sent! Transaction hash:', receipt.transactionHash)
        console.log(`�� Player ${playerId} will claim zones on destination chain`)
        console.log(`🎯 Compose message: ${composeMsg}`)
    })
