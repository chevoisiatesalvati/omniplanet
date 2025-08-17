import { task } from 'hardhat/config'

interface ReadGameStateParam {
    contract: string // The UniStar contract address
    gas: string // Gas amount in ETH
}

task('read-game-state', 'Read game state from multiple chains using UniStar')
    .addParam('contract', 'The UniStar contract address')
    .addOptionalParam('gas', 'Gas amount in ETH (default: 0.1)', '0.1')
    .setAction(async (taskArgs, { ethers, deployments }) => {
        const { contract, gas } = taskArgs as ReadGameStateParam

        console.log(' Reading game state from multiple chains...')
        console.log(`Contract: ${contract}`)
        console.log(`Gas: ${gas} ETH`)

        try {
            // Get the contract instance
            const uniStar = await ethers.getContractAt('UniStar', contract)

            // Create extra options for gas allocation
            const extraOptions = ethers.utils.defaultAbiCoder.encode(
                ['uint128', 'uint128'],
                [
                    ethers.utils.parseEther('0.05'), // gasForCall
                    ethers.utils.parseEther('0.05'), // gasForPost
                ]
            )

            console.log('📡 Sending read request...')

            // Send the read request
            const tx = await uniStar.readGameState(extraOptions, {
                value: ethers.utils.parseEther(gas),
            })

            console.log(`✅ Transaction sent: ${tx.hash}`)
            console.log('⏳ Waiting for confirmation...')

            // Wait for confirmation
            const receipt = await tx.wait()
            console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`)

            // Get the transaction details
            const gasUsed = receipt.gasUsed.toString()
            const effectiveGasPrice = receipt.effectiveGasPrice.toString()

            console.log(`📊 Gas used: ${gasUsed}`)
            console.log(`💰 Effective gas price: ${ethers.utils.formatUnits(effectiveGasPrice, 'gwei')} gwei`)

            console.log('\n🎯 Read request sent successfully!')
            console.log('📡 The contract will now read from:')
            console.log('   - Arbitrum Sepolia (Defense zones)')
            console.log('   - Base Sepolia (Attack zones)')
            console.log('\n⏰ Wait for the AggregatedGameState event to see results...')
            console.log(`🎮 Transaction hash: ${receipt.transactionHash}`)
        } catch (error) {
            console.error('❌ Error reading game state:', error)
            process.exit(1)
        }
    })
