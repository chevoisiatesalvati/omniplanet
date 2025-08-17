// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import necessary interfaces and contracts
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { ILayerZeroEndpointV2, MessagingFee, MessagingReceipt, Origin } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroEndpointV2.sol";
import { AddressCast } from "@layerzerolabs/lz-evm-protocol-v2/contracts/libs/AddressCast.sol";

import { ReadCodecV1, EVMCallComputeV1, EVMCallRequestV1 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/ReadCodecV1.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { OAppRead } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppRead.sol";

/**
 * @title GameStateReader
 * @notice Contract to read game state from MyONFT721ComposerMock contracts on multiple chains using LayerZero lzRead.
 * @dev Extends OAppRead and OAppOptionsType3 for cross-chain read and compute operations.
 */
contract UniStar is OAppRead, OAppOptionsType3 {
    /// @notice Emitted when the aggregated game state is computed and received.
    /// @param totalZones Total zones across all chains
    /// @param player1TotalZones Total zones for player 1 across all chains
    /// @param player2TotalZones Total zones for player 2 across all chains
    /// @param playerPerformance Array of player zone counts per chain
    event AggregatedGameState(
        uint256 totalZones,
        uint256 player1TotalZones,
        uint256 player2TotalZones,
        uint8[][] playerPerformance
    );

    /// @notice LayerZero read message type.
    uint8 private constant READ_MSG_TYPE = 1;

    /// @notice LayerZero read channel ID.
    uint32 public READ_CHANNEL;

    /// @notice Struct to hold chain-specific configurations.
    struct ChainConfig {
        uint16 confirmations; // Number of confirmations required
        address composerAddress; // Address of the MyONFT721ComposerMock contract
        uint32 chainEid; // Chain endpoint ID
    }

    /// @notice Array to store all active targetEids for iteration.
    uint32[] public targetEids;

    /// @notice Mapping to store chain configurations indexed by target chain ID (targetEid).
    mapping(uint32 => ChainConfig) public chainConfigs;

    // ===========================
    // ======== CONSTANTS ========
    // ===========================

    // Chain A: Arbitrum Sepolia (Defense zones)
    uint32 public constant CHAIN_A_EID = 40231; // LayerZero EID for Arb Sepolia
    address public constant CHAIN_A_COMPOSER = 0x35Eb2Aba1d06CFeB20729142E61005F418F8459e; // Replace with actual composer address

    // Chain B: Base Sepolia (Attack zones)
    uint32 public constant CHAIN_B_EID = 40245; // LayerZero EID for Base Sepolia
    address public constant CHAIN_B_COMPOSER = 0xC5a12E8A9236a66C66f1a0DEB298e51285B1f82f; // Replace with actual composer address

    // ===========================
    // ======= CONSTRUCTOR =======
    // ===========================

    /**
     * @notice Constructor to initialize the GameStateReader contract with hardcoded chain configurations.
     * @param _endpoint The LayerZero endpoint contract address.
     * @param _readChannel The LayerZero read channel ID.
     */
    constructor(address _endpoint, uint32 _readChannel) OAppRead(_endpoint, msg.sender) Ownable(msg.sender) {
        // Initialize Chain A Configuration (Arbitrum Sepolia - Defense)
        ChainConfig memory chainAConfig = ChainConfig({
            confirmations: 5,
            composerAddress: CHAIN_A_COMPOSER,
            chainEid: CHAIN_A_EID
        });

        // Initialize Chain B Configuration (Base Sepolia - Attack)
        ChainConfig memory chainBConfig = ChainConfig({
            confirmations: 5,
            composerAddress: CHAIN_B_COMPOSER,
            chainEid: CHAIN_B_EID
        });

        // Set Chain A Configuration
        chainConfigs[CHAIN_A_EID] = chainAConfig;
        targetEids.push(CHAIN_A_EID);

        // Set Chain B Configuration
        chainConfigs[CHAIN_B_EID] = chainBConfig;
        targetEids.push(CHAIN_B_EID);

        // Set the read channel
        READ_CHANNEL = _readChannel;
        _setPeer(READ_CHANNEL, AddressCast.toBytes32(address(this)));
    }

    // ===========================
    // ======= FUNCTIONS =========
    // ===========================

    /**
     * @notice Sets the LayerZero read channel, enabling or disabling it based on `_active`.
     * @param _channelId The channel ID to set.
     * @param _active Flag to activate or deactivate the channel.
     */
    function setReadChannel(uint32 _channelId, bool _active) public override onlyOwner {
        _setPeer(_channelId, _active ? AddressCast.toBytes32(address(this)) : bytes32(0));
        READ_CHANNEL = _channelId;
    }

    /**
     * @notice Sends a read request to LayerZero, querying game state from MyONFT721ComposerMock contracts on configured chains.
     * @param _extraOptions Additional messaging options, including gas and fee settings.
     * @return receipt The LayerZero messaging receipt for the request.
     */
    function readGameState(
        bytes calldata _extraOptions
    ) external payable returns (MessagingReceipt memory receipt) {
        bytes memory cmd = getCmd();
        return
            _lzSend(
                READ_CHANNEL,
                cmd,
                combineOptions(READ_CHANNEL, READ_MSG_TYPE, _extraOptions),
                MessagingFee(msg.value, 0),
                payable(msg.sender)
            );
    }

    /**
     * @notice Quotes the estimated messaging fee for querying game state from MyONFT721ComposerMock contracts.
     * @param _extraOptions Additional messaging options.
     * @param _payInLzToken Boolean flag indicating whether to pay in LayerZero tokens.
     * @return fee The estimated messaging fee.
     */
    function quoteGameState(
        bytes calldata _extraOptions,
        bool _payInLzToken
    ) external view returns (MessagingFee memory fee) {
        bytes memory cmd = getCmd();
        return _quote(READ_CHANNEL, cmd, combineOptions(READ_CHANNEL, READ_MSG_TYPE, _extraOptions), _payInLzToken);
    }

    /**
     * @notice Constructs a command to query the game state from MyONFT721ComposerMock contracts on all configured chains.
     * @return cmd The encoded command to request game state data.
     */
    function getCmd() public view returns (bytes memory) {
        uint256 chainCount = targetEids.length; // This will be 2
        EVMCallRequestV1[] memory readRequests = new EVMCallRequestV1[](chainCount); // 1 call per chain = 2 total

        uint256 requestIndex = 0;
        for (uint256 i = 0; i < chainCount; i++) {
            uint32 targetEid = targetEids[i];
            ChainConfig memory config = chainConfigs[targetEid];

            // Call getGameState() function on the composer contract
            bytes memory gameStateCallData = abi.encodeWithSelector(
                bytes4(keccak256("getGameState()")), // getGameState() function selector
                "" // No parameters needed
            );

            readRequests[requestIndex] = EVMCallRequestV1({
                appRequestLabel: uint16(requestIndex + 1),
                targetEid: targetEid,
                isBlockNum: false,
                blockNumOrTimestamp: uint64(block.timestamp),
                confirmations: config.confirmations,
                to: config.composerAddress,
                callData: gameStateCallData
            });
            requestIndex++;
        }

        EVMCallComputeV1 memory computeSettings = EVMCallComputeV1({
            computeSetting: 2, // lzMap() and lzReduce()
            targetEid: ILayerZeroEndpointV2(endpoint).eid(),
            isBlockNum: false,
            blockNumOrTimestamp: uint64(block.timestamp),
            confirmations: 15,
            to: address(this)
        });

        return ReadCodecV1.encode(0, readRequests, computeSettings);
    }

    /**
     * @notice Processes individual game state responses, encoding the result.
     * @param _response The response from the read request.
     * @return Encoded game state data.
     */
    function lzMap(bytes calldata, bytes calldata _response) external pure returns (bytes memory) {
        require(_response.length >= 64, "Invalid response length"); // 2 uint8 values = 64 bytes

        // Decode the getGameState() response: (uint8, uint8)
        (uint8 player1Zones, uint8 player2Zones) = abi.decode(_response, (uint8, uint8));
        
        return abi.encode(player1Zones, player2Zones);
    }

    /**
     * @notice Aggregates individual game state responses to compute totals.
     * @param _responses Array of mapped responses containing game state data.
     * @return Encoded aggregated game state.
     */
    function lzReduce(bytes calldata, bytes[] calldata _responses) external pure returns (bytes memory) {
        require(_responses.length == 2, "Expected responses from 2 chains");
        
        uint256 totalPlayer1Zones = 0;
        uint256 totalPlayer2Zones = 0;
        uint8[][] memory playerPerformance = new uint8[][](2); // Track player zones per chain
        
        // Process responses from each chain
        for (uint256 i = 0; i < 2; i++) {
            // Decode game state response
            (uint8 player1Zones, uint8 player2Zones) = abi.decode(_responses[i], (uint8, uint8));
            
            // Aggregate data
            totalPlayer1Zones += player1Zones;
            totalPlayer2Zones += player2Zones;
            
            // Track player performance for this chain
            playerPerformance[i] = new uint8[](2);
            playerPerformance[i][0] = player1Zones;
            playerPerformance[i][1] = player2Zones;
        }
        
        uint256 totalZones = totalPlayer1Zones + totalPlayer2Zones;
        
        return abi.encode(totalZones, totalPlayer1Zones, totalPlayer2Zones, playerPerformance);
    }

    /**
     * @notice Handles the aggregated game state received from LayerZero.
     * @dev Emits the AggregatedGameState event with the calculated totals.
     * @param _message Encoded aggregated game state data.
     */
    function _lzReceive(
        Origin calldata,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address,
        bytes calldata
    ) internal override {
        // Decode the aggregated data
        (uint256 totalZones, uint256 player1TotalZones, uint256 player2TotalZones, uint8[][] memory playerPerformance) = 
            abi.decode(_message, (uint256, uint256, uint256, uint8[][]));
        
        emit AggregatedGameState(totalZones, player1TotalZones, player2TotalZones, playerPerformance);
    }

    /// @notice Allows the contract to receive Ether.
    receive() external payable {}
}
