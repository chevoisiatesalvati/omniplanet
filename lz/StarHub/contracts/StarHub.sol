// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { OApp, Origin, MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract StarHub is OApp, OAppOptionsType3 {
    /// @notice Last string received from any remote chain
    string public lastMessage;

    /// @notice Msg type for sending a string, for use in OAppOptionsType3 as an enforced option
    uint16 public constant SEND = 1;

    // Global game state tracking
    // mapping(round => (player1Complete, player2Complete))
    mapping(uint8 => bool[2]) public roundCompletions;

    // Player health tracking
    mapping(uint8 => uint8) public playerHealth;
    uint8 public constant MAX_HEALTH = 7;

    // Player zone tracking (from both chains)
    mapping(uint8 => uint8) public playerAttackZones;  // Chain A zones
    mapping(uint8 => uint8) public playerDefenseZones; // Chain B zones

    // Game state
    bool public gameActive = false;
    uint8 public currentRound = 0;
    address public winner = address(0);
    
    // Events
    event PlayerActionReceived(uint8 indexed playerId, uint8 indexed round, uint8 zones);
    event RoundCompleted(uint8 indexed round, bool player1Complete, bool player2Complete);
    event GameStarted(uint8 player1Health, uint8 player2Health);
    event DamageDealt(uint8 indexed attacker, uint8 indexed defender, uint8 damage);
    event PlayerHealthUpdated(uint8 indexed playerId, uint8 oldHealth, uint8 newHealth);
    event GameEnded(uint8 indexed winner, uint8 finalHealth);


    /// @notice Initialize with Endpoint V2 and owner address
    /// @param _endpoint The local chain's LayerZero Endpoint V2 address
    /// @param _owner    The address permitted to configure this OApp
    constructor(address _endpoint, address _owner) OApp(_endpoint, _owner) Ownable(_owner) {}

    /// @notice Start a new game
    function startGame() external {
        require(!gameActive, "Game already active");
        
        // Initialize player health
        playerHealth[1] = MAX_HEALTH;
        playerHealth[2] = MAX_HEALTH;
        
        // Initialize zones
        playerAttackZones[1] = 0;
        playerAttackZones[2] = 0;
        playerDefenseZones[1] = 0;
        playerDefenseZones[2] = 0;
        
        // Reset round completions - clear specific rounds
       for (uint8 i = 1; i <= 10; i++) {
            delete roundCompletions[i];
        }
        
        gameActive = true;
        currentRound = 1;
        winner = address(0);
        
        emit GameStarted(MAX_HEALTH, MAX_HEALTH);
    }

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
    function sendString(uint32 _dstEid, string calldata _string, bytes calldata _options) external payable {
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
        Origin calldata _origin,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        // Decode the incoming message from the composer
        // Format: abi.encode(playerId, zones, currentRound)
        (uint8 playerId, uint8 zones) = abi.decode(_message, (uint8, uint8));
        
        // Validate player ID
        require(playerId == 1 || playerId == 2, "Invalid player ID");

        // Update player zones based on source chain
        if (_origin.srcEid == 40245) { // Chain A - Attack zones // todo: fix it
            playerAttackZones[playerId] = zones;
        } else if (_origin.srcEid == 40231) { // Chain B - Defense zones
            playerDefenseZones[playerId] = zones;
        }
        
        // Mark the player's action as complete for this round
        // playerId 1 maps to index 0, playerId 2 maps to index 1
        roundCompletions[currentRound][playerId - 1] = true;
        
        emit PlayerActionReceived(playerId, currentRound, zones);
        
        // Check if both players have completed their actions for this round
        bool[2] memory completions = roundCompletions[currentRound];
        if (completions[0] && completions[1]) {
            emit RoundCompleted(currentRound, completions[0], completions[1]);
            
            // Both players have completed their actions for this round
            _processRound(currentRound);
        }
        
        // Store the last message for debugging
        lastMessage = string(abi.encodePacked(
            "Player ", 
            _uint8ToString(playerId), 
            " completed round ", 
            _uint8ToString(currentRound), 
            " with ", 
            _uint8ToString(zones), 
            " zones"
        ));
    }

    /// @notice Helper function to convert uint8 to string
    function _uint8ToString(uint8 _value) internal pure returns (string memory) {
        if (_value == 0) return "0";
        
        uint8 temp = _value;
        uint8 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (_value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + _value % 10));
            _value /= 10;
        }
        
        return string(buffer);
    }

    /// @notice Process a completed round
    function _processRound(uint8 _round) internal {
        require(gameActive, "Game not active");
        
        // Calculate damage for both players
        uint8 damageToPlayer1 = _calculateDamage(2, 1); // Player 2 attacks Player 1
        uint8 damageToPlayer2 = _calculateDamage(1, 2); // Player 1 attacks Player 2
        
        // Apply damage
        if (damageToPlayer1 > 0) {
            _applyDamage(1, damageToPlayer1);
        }
        
        if (damageToPlayer2 > 0) {
            _applyDamage(2, damageToPlayer2);
        }
        
        // Check if game is over
        if (playerHealth[1] == 0 || playerHealth[2] == 0) {
            _endGame();
        } else {
            // Prepare for next round
            currentRound++;
            
            // Reset round completions for next round
            delete roundCompletions[_round];
        }
    }

    /// @notice Calculate damage between two players
    function _calculateDamage(uint8 _attacker, uint8 _defender) internal view returns (uint8) {
        uint8 attackPower = playerAttackZones[_attacker];
        uint8 defensePower = playerDefenseZones[_defender];
        
        // Damage = Attack - Defense, minimum 0
        if (attackPower > defensePower) {
            return attackPower - defensePower;
        }
        return 0;
    }

    /// @notice Apply damage to a player
    function _applyDamage(uint8 _playerId, uint8 _damage) internal {
        uint8 oldHealth = playerHealth[_playerId];
        
        if (_damage >= oldHealth) {
            playerHealth[_playerId] = 0;
        } else {
            playerHealth[_playerId] = oldHealth - _damage;
        }
        
        emit DamageDealt(_playerId == 1 ? 2 : 1, _playerId, _damage);
        emit PlayerHealthUpdated(_playerId, oldHealth, playerHealth[_playerId]);
    }

    /// @notice End the game and determine winner
    function _endGame() internal {
        gameActive = false;
        
        if (playerHealth[1] == 0) {
            winner = address(1); // Player 2 wins
            emit GameEnded(2, playerHealth[2]);
        } else {
            winner = address(0); // Player 1 wins
            emit GameEnded(1, playerHealth[1]);
        }
    }
    
    /// @notice Reset game state (owner only)
    function resetGame() external onlyOwner {
        gameActive = false;
        currentRound = 0;
        winner = address(0);
        
        // Clear all mappings
        for (uint8 i = 1; i <= 10; i++) { // Clear up to 10 rounds
            delete roundCompletions[i];
        }
        
        delete playerHealth[1];
        delete playerHealth[2];
        delete playerAttackZones[1];
        delete playerAttackZones[2];
        delete playerDefenseZones[1];
        delete playerDefenseZones[2];
    }
    
    /// @notice Get current game state
    function getGameState() external view returns (
        bool active,
        uint8 round,
        uint8 player1Health,
        uint8 player2Health,
        uint8 player1Attack,
        uint8 player1Defense,
        uint8 player2Attack,
        uint8 player2Defense,
        address gameWinner
    ) {
        return (
            gameActive,
            currentRound,
            playerHealth[1],
            playerHealth[2],
            playerAttackZones[1],
            playerDefenseZones[1],
            playerAttackZones[2],
            playerDefenseZones[2],
            winner
        );
    }

}
