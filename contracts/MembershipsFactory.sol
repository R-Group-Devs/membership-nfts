//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Memberships} from "./Memberships.sol";

contract MembershipsFactory {
    //===== State =====//
    address immutable memberships;

    //===== Events =====//

    event CreateMemberships(
        address address_,
        string name,
        string symbol,
        string organization,
        bool transferable,
        address owner
    );

    //===== Constructor =====//

    constructor() {
        memberships = address(new Memberships());
    }

    //===== External Functions =====//

    function createMemberships(
        string memory name,
        string memory symbol,
        string memory organization,
        bool transferable,
        address owner
    ) external returns (address) {
        address clone = Clones.clone(memberships);
        Memberships(clone).initialize(
            name,
            symbol,
            organization,
            transferable,
            owner
        );
        emit CreateMemberships(
            clone,
            name,
            symbol,
            organization,
            transferable,
            owner
        );
        return clone;
    }
}
