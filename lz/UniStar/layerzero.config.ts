import { ChannelId, EndpointId } from '@layerzerolabs/lz-definitions'
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'

import type { OAppReadOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const sepoliaContract: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'UniStar',
}

const config: OAppReadOmniGraphHardhat = {
    contracts: [
        {
            contract: sepoliaContract,
            config: {
                readChannelConfigs: [
                    {
                        channelId: ChannelId.READ_CHANNEL_1,
                        active: true,
                        readLibrary: '0x908E86e9cb3F16CC94AE7569Bf64Ce2CE04bbcBE',
                        ulnConfig: {
                            executor: '0x718B92b5CB0a5552039B593faF724D182A881eDA',
                            requiredDVNs: ['0x530fbe405189204ef459fa4b767167e4d41e3a37'],
                        },
                        enforcedOptions: [
                            {
                                msgType: 1,
                                optionType: ExecutorOptionType.LZ_READ,
                                gas: 65000,
                                value: 0,
                                size: 100,
                            },
                        ],
                    },
                ],
            },
        },
    ],
    connections: [],
}

export default config
