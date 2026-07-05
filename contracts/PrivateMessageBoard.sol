// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// This contract allows users to post and read messages on the blockchain
contract PrivateMessageBoard {
    
    // Structure to hold a single message
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
    }

    // Array to store all messages on-chain
    Message[] public messages;

    // Event that runs when a new message is posted
    event NewMessage(address indexed sender, string content, uint256 timestamp);

    // Function to post a message
    function postMessage(string memory _content) public {
        // Create a new message and add it to the array
        messages.push(Message(msg.sender, _content, block.timestamp));
        
        // Broadcast the event
        emit NewMessage(msg.sender, _content, block.timestamp);
    }

    // Function to get the total number of messages
    function getMessageCount() public view returns (uint256) {
        return messages.length;
    }

    // Function to get a specific message by its index
    function getMessage(uint256 index) public view returns (address, string memory, uint256) {
        require(index < messages.length, "Message does not exist");
        Message memory msgItem = messages[index];
        return (msgItem.sender, msgItem.content, msgItem.timestamp);
    }
}
