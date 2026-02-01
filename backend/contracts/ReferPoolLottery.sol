// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserIPFSStorage {
    struct User {
        string name;           // user's name
        string[] ipfsCIDs;     // list of IPFS CIDs for this user
        bool exists;           // flag to check if user is registered
    }

    mapping(address => User) private users;
    address public admin;

    event UserRegistered(address indexed userAddress, string name);
    event CIDAdded(address indexed userAddress, string cid);

    constructor() {
        admin = msg.sender; // Set contract deployer as admin
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier onlyRegistered(address _user) {
        require(users[_user].exists, "User not registered");
        _;
    }

    /// @notice Admin registers a new user with a name
    /// @param _userAddress The address of the user to register
    /// @param _name The name of the user
    function registerUser(address _userAddress, string calldata _name) external onlyAdmin {
        require(!users[_userAddress].exists, "Already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");

        users[_userAddress].name = _name;
        users[_userAddress].exists = true;

        emit UserRegistered(_userAddress, _name);
    }

    /// @notice Admin adds a new IPFS CID to a user's list
    /// @param _userAddress The address of the user
    /// @param _cid The IPFS CID to add
    function addCIDForUser(address _userAddress, string calldata _cid) external onlyAdmin onlyRegistered(_userAddress) {
        require(bytes(_cid).length > 0, "CID cannot be empty");

        users[_userAddress].ipfsCIDs.push(_cid);

        emit CIDAdded(_userAddress, _cid);
    }

    /// @notice Get user details (name + list of CIDs)
    function getUser(address _user)
        external
        view
        returns (string memory, string[] memory)
    {
        require(users[_user].exists, "User not registered");
        return (users[_user].name, users[_user].ipfsCIDs);
    }

    /// @notice Get all CIDs of a specific user
    function getUserCIDs(address _user) external view onlyRegistered(_user) returns (string[] memory) {
        return users[_user].ipfsCIDs;
    }

    /// @notice Check if an address is registered
    function isRegistered(address _user) external view returns (bool) {
        return users[_user].exists;
    }

    /// @notice Change admin address
    function changeAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }
}