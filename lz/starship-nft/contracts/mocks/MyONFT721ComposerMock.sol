// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { IOAppComposer } from "@layerzerolabs/oapp-evm/contracts/oapp/interfaces/IOAppComposer.sol";
import { OApp, Origin, MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OptionsBuilder } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OptionsBuilder.sol";
import { ONFTComposeMsgCodec } from "@layerzerolabs/onft-evm/contracts/libs/ONFTComposeMsgCodec.sol";

/*
*
The Composer on ChainA (Base testnet) and ChainB (Arbitrum One testnet) handles the zone logic, 
where a it maintains claims (zones[playerId] += rand(-1,2), min 0, max 5).
It validates the random value, updates local zones, sends a message to ChainH’s OApp via send within a Composer indicating logic is done.
*
*/

contract MyONFT721ComposerMock is IOAppComposer, OApp, OAppOptionsType3 {
    // default empty values for testing a lzCompose received message
    address public from;
    bytes32 public guid;
    bytes public message;
    address public executor;
    bytes public extraData;

    using ONFTComposeMsgCodec for bytes;
    using ONFTComposeMsgCodec for bytes32;

    /// @notice Last string received from any remote chain
    string public lastMessage;

    /// @notice Msg type for sending a string, for use in OAppOptionsType3 as an enforced option
    uint16 public constant SEND = 1;

    using OptionsBuilder for bytes;

    // Zone management
    mapping(uint8 => uint8) public zones;
    uint8 public constant MAX_ZONES = 7;
    uint8 public constant MIN_ZONES = 0;
    uint8 public currentRound = 1;

    // Events
    event ZoneClaimed(uint8 indexed playerId, uint8 oldZones, uint8 newZones, int8 bonus);
    event RoundIncremented(uint8 newRound);

    function _incrementRound() internal {
        currentRound += 1;
        emit RoundIncremented(currentRound);
    }

    function _claimZones(uint8 _playerId) internal {
        require(_playerId > 0 && _playerId <= 2, "Invalid player ID (must be 1 or 2)");
        
        uint8 currentZones = zones[_playerId];
        int8 bonus = _getRandomBonus();
        uint8 newZones = _calculateNewZones(currentZones, bonus);
        
        // Update zones
        zones[_playerId] = newZones;
        emit ZoneClaimed(_playerId, currentZones, newZones, bonus);
    }

    /// @notice Calculate new zones with bonus, clamped to min/max
    function _calculateNewZones(uint8 _currentZones, int8 _bonus) internal pure returns (uint8) {
        int16 newZones = int16(uint16(_currentZones)) + int16(_bonus);
        
        if (newZones < int16(uint16(MIN_ZONES))) return MIN_ZONES;
        if (newZones > int16(uint16(MAX_ZONES))) return MAX_ZONES;
        
        return uint8(uint16(newZones));
    }

    /// @notice Get a random bonus between -1 and +2
    function _getRandomBonus() internal view returns (int8) {
        // Simple pseudo-random number generation
        // In production, consider using Chainlink VRF or similar
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender
        ))) % 4;
        
        if (random == 0) return -1;
        if (random == 1) return 0;
        if (random == 2) return 1;
        return 2;
    }


    /// @notice Initialize with Endpoint V2 and owner address
    /// @param _endpoint The local chain's LayerZero Endpoint V2 address
    /// @param _owner    The address permitted to configure this OApp
    constructor(address _endpoint, address _owner) OApp(_endpoint, _owner) Ownable(_owner) {}

    // ──────────────────────────────────────────────────────────────────────────────
    // 0. (Optional) Quote business logic
    //
    // Example: Get a quote from the Endpoint for a cost estimate of sending a message.
    // Replace this to mirror your own send business logic.
    // ──────────────────────────────────────────────────────────────────────────────

    /**
     * @notice Quotes the gas needed to pay for the full omnichain transaction in native gas or ZRO token.
     * @param _dstEid Destination chain's endpoint ID.
     * @param _string The string to send.
     * @param _options Message execution options (e.g., for sending gas to destination).
     * @param _payInLzToken Whether to return fee in ZRO token.
     * @return fee A `MessagingFee` struct containing the calculated gas fee in either the native token or ZRO token.
     */
    function quoteSendString(
        uint32 _dstEid,
        string calldata _string,
        bytes calldata _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        bytes memory _message = abi.encode(_string);
        // combineOptions (from OAppOptionsType3) merges enforced options set by the contract owner
        // with any additional execution options provided by the caller
        fee = _quote(_dstEid, _message, combineOptions(_dstEid, SEND, _options), _payInLzToken);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 1. Send business logic
    //
    // Example: send a simple string to a remote chain. Replace this with your
    // own state-update logic, then encode whatever data your application needs.
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Send a string to a remote OApp on another chain
    /// @param _dstEid   Destination Endpoint ID (uint32)
    /// @param _string  The string to send
    /// @param _options  Execution options for gas on the destination (bytes)
    function sendString(uint32 _dstEid, string calldata _string, bytes calldata _options) public payable {
        // 1. (Optional) Update any local state here.
        //    e.g., record that a message was "sent":
        //    sentCount += 1;

        // 2. Encode any data structures you wish to send into bytes
        //    You can use abi.encode, abi.encodePacked, or directly splice bytes
        //    if you know the format of your data structures
        bytes memory _message = abi.encode(_string);

        // 3. Call OAppSender._lzSend to package and dispatch the cross-chain message
        //    - _dstEid:   remote chain's Endpoint ID
        //    - _message:  ABI-encoded string
        //    - _options:  combined execution options (enforced + caller-provided)
        //    - MessagingFee(msg.value, 0): pay all gas as native token; no ZRO
        //    - payable(msg.sender): refund excess gas to caller
        //
        //    combineOptions (from OAppOptionsType3) merges enforced options set by the contract owner
        //    with any additional execution options provided by the caller
        _lzSend(
            _dstEid,
            _message,
            combineOptions(_dstEid, SEND, _options),
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );
    }

    /// @notice Send raw bytes to a remote chain
    function sendBytes(uint32 _dstEid, bytes calldata _data, bytes calldata _options) public payable {
        _lzSend(
            _dstEid,
            _data,
            combineOptions(_dstEid, SEND, _options),
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 2. Receive business logic
    //
    // Override _lzReceive to decode the incoming bytes and apply your logic.
    // The base OAppReceiver.lzReceive ensures:
    //   • Only the LayerZero Endpoint can call this method
    //   • The sender is a registered peer (peers[srcEid] == origin.sender)
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Invoked by OAppReceiver when EndpointV2.lzReceive is called
    /// @dev   _origin    Metadata (source chain, sender address, nonce)
    /// @dev   _guid      Global unique ID for tracking this message
    /// @param _message   ABI-encoded bytes (the string we sent earlier)
    /// @dev   _executor  Executor address that delivered the message
    /// @dev   _extraData Additional data from the Executor (unused here)
    function _lzReceive(
        Origin calldata /*_origin*/,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        // 1. Decode the incoming bytes into a string
        //    You can use abi.decode, abi.decodePacked, or directly splice bytes
        //    if you know the format of your data structures
        string memory _string = abi.decode(_message, (string));

        // 2. Apply your custom logic. In this example, store it in `lastMessage`.
        lastMessage = _string;

        // 3. (Optional) Trigger further on-chain actions.
        //    e.g., emit an event, mint tokens, call another contract, etc.
        //    emit MessageReceived(_origin.srcEid, _string);
    }

    function lzCompose(
        address _from,
        bytes32 _guid,
        bytes calldata _message,
        address _executor,
        bytes calldata /*_extraData*/
    ) external payable {
        from = _from;
        guid = _guid;
        message = _message;
        executor = _executor;
        extraData = _message;

        // Decode the message to get playerId
        uint8 playerId = abi.decode(_message, (uint8));

        // Claim zones for the player
        _claimZones(playerId);

        // Increment round
        _incrementRound();

        bytes memory update = abi.encode(playerId, zones[playerId], currentRound);
        
        // CORRECT: Use dedicated sendBytes function
        this.sendBytes{value: msg.value}(40161, update, "");
    }

    function hardSetZones(uint8 _playerId, uint8 _zones) external onlyOwner {
        require(_playerId > 0 && _playerId <= 2, "Invalid player ID (must be 1 or 2)");
        require(_zones <= MAX_ZONES, "Zones exceed maximum");
        
        uint8 oldZones = zones[_playerId];
        zones[_playerId] = _zones;
        
        emit ZoneClaimed(_playerId, oldZones, _zones, 0);
    }

    /// @notice Hard-set round number (for testing purposes)
    /// @param _round The round number to set
    function hardSetRound(uint8 _round) external onlyOwner {
        uint8 oldRound = currentRound;
        currentRound = _round;
        
        emit RoundIncremented(_round);
    }

    /// @notice Reset all zones to 0 (for testing purposes)
    function resetAllZones() external onlyOwner {
        uint8 oldZones1 = zones[1];
        uint8 oldZones2 = zones[2];
        
        zones[1] = 0;
        zones[2] = 0;
        
        emit ZoneClaimed(1, oldZones1, 0, 0);
        emit ZoneClaimed(2, oldZones2, 0, 0);
    }

    /// @notice Get current game state for testing
    function getGameState() external view returns (
        uint8 player1Zones,
        uint8 player2Zones,
        uint8 round
    ) {
        return (zones[1], zones[2], currentRound);
    }
}
