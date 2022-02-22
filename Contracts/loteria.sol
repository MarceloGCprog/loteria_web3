// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract Loteria {
    address public manager;
    address[] private players;

    constructor(){
        manager = msg.sender;
    }

    modifier restricao(){
        require(msg.sender == manager);
        _;
    }

    function enterGame() public payable{
        require(msg.value > 0.001 ether);

        players.push(msg.sender);
    }

    function getPlayers() public view returns(address[] memory){
        return players;
    }

    function random() private view returns(uint256) {

        return uint256(keccak256(abi.encode(block.difficulty,block.timestamp,players)));

    }

    function winnerPick() public payable restricao{

        uint index = random() % players.length;

        address winner = players[index];

        payable(winner).transfer(address(this).balance);

        players = new address[](0);
    }
}