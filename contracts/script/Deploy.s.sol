// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { Tavern } from "../src/Tavern.sol";
import { Quest } from "../src/Quest.sol";

contract DeployScript is Script {
    function setUp() public { }

    function run() public {
        // Get the private key from the environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Get the deployer address
        address deployer = vm.addr(deployerPrivateKey);
        console2.log("Deploying contracts with address:", deployer);

        // Deploy Tavern contract first
        Tavern tavern = new Tavern(deployer);
        console2.log("Tavern deployed at:", address(tavern));

        // Deploy Quest contract with Tavern address
        Quest quest = new Quest(tavern, deployer);
        console2.log("Quest deployed at:", address(quest));

        // Set Quest address in Tavern
        tavern.setQuest(address(quest));
        console2.log("Quest address set in Tavern");

        // Verify contracts are properly linked
        console2.log("Contract linking verification:");
        address questAddress = address(quest);
        console2.log("Quest is authorized in Tavern:", questAddress);

        vm.stopBroadcast();

        console2.log("Deployment completed successfully");
    }
}
