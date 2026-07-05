// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PublicMessageBoard
/// @notice A public decentralized bulletin board where users can post messages and see a digital forest grow.
contract PublicMessageBoard {
    
    /// @notice Structure to hold a single message
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
    }

    /// @notice Array containing all messages posted to this bulletin board
    Message[] public messages;

    /// @notice Event emitted when a new message is successfully posted
    /// @param sender The address of the poster
    /// @param content The text content of the message
    /// @param timestamp The time at which the block was mined
    event NewMessage(address indexed sender, string content, uint256 timestamp);

    /// @notice Posts a message to the bulletin board
    /// @dev Reverts if the message is empty or exceeds 280 characters
    /// @param _content The message body to post
    function postMessage(string memory _content) public {
        require(bytes(_content).length > 0, "Message cannot be empty");
        require(bytes(_content).length <= 280, "Message exceeds 280 characters");
        
        messages.push(Message(msg.sender, _content, block.timestamp));
        
        emit NewMessage(msg.sender, _content, block.timestamp);
    }

    /// @notice Returns the total count of messages posted
    /// @return The number of messages in the array
    function getMessageCount() public view returns (uint256) {
        return messages.length;
    }

    /// @notice Gets a specific message by its index
    /// @param index The position in the message array
    /// @return sender The address of the user who sent the message
    /// @return content The body text of the message
    /// @return timestamp The blockchain timestamp of the message
    function getMessage(uint256 index) public view returns (address sender, string memory content, uint256 timestamp) {
        require(index < messages.length, "Message does not exist");
        Message memory msgItem = messages[index];
        return (msgItem.sender, msgItem.content, msgItem.timestamp);
    }

    /// @notice Retrieves a batch of messages for pagination
    /// @dev Returns an array of message structs from the start index up to start + count (capped at message length)
    /// @param start The starting index of the slice to fetch
    /// @param count The number of messages to fetch
    /// @return An array of Message structs
    function getMessages(uint256 start, uint256 count) public view returns (Message[] memory) {
        require(start < messages.length || messages.length == 0, "Start out of range");
        if (messages.length == 0) {
            return new Message[](0);
        }
        uint256 end = start + count;
        if (end > messages.length) {
            end = messages.length;
        }
        Message[] memory result = new Message[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = messages[i];
        }
        return result;
    }
}
