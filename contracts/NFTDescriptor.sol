//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "base64-sol/base64.sol";

library NFTDescriptor {
    struct TokenURIParams {
        uint256 id;
        address owner;
        string nickName;
        string organization;
        string tokenName;
    }

    struct RgbColor {
        uint256 r;
        uint256 g;
        uint256 b;
    }

    /**
     * @notice Construct an ERC721 token URI.
     */
    function constructTokenURI(TokenURIParams calldata params)
        public
        pure
        returns (string memory)
    {
        string memory output = buildOutput(params);
        // prettier-ignore
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
          '{ "id": ',
          Strings.toString(params.id),
          ', "nickName": "',
          params.nickName,
          '", "organization": "',
          params.organization,
          '", "tokenName": "',
          params.tokenName,
          '", "image": "data:image/svg+xml;base64,',
          Base64.encode(bytes(output)),
          '" }'
        ))));
        // prettier-ignore
        return string(abi.encodePacked('data:application/json;base64,', json));
    }

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function pluckColor(string memory seed1, string memory seed2)
        internal
        pure
        returns (RgbColor memory)
    {
        RgbColor memory rgb = RgbColor(
            random(string(abi.encodePacked(seed1, seed2))) % 255,
            random(seed1) % 255,
            random(seed2) % 255
        );
        return rgb;
    }

    function rotateColor(RgbColor memory rgb)
        internal
        pure
        returns (RgbColor memory)
    {
        RgbColor memory rotated = RgbColor(
            (rgb.r + 128) % 255,
            (rgb.g + 128) % 255,
            (rgb.b + 128) % 255
        );
        return rotated;
    }

    function colorToString(RgbColor memory rgb)
        internal
        pure
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    "rgba",
                    "(",
                    Strings.toString(rgb.r),
                    ",",
                    Strings.toString(rgb.g),
                    ",",
                    Strings.toString(rgb.b),
                    ", 1)"
                )
            );
    }

    function buildOutput(TokenURIParams calldata params)
        internal
        pure
        returns (string memory)
    {
        RgbColor memory rgb1 = pluckColor(
            params.organization,
            params.tokenName
        );
        RgbColor memory rgb2 = rotateColor(rgb1);
        string memory color1 = colorToString(rgb1);
        // prettier-ignore
        string memory output = string(abi.encodePacked(
          '<svg width="300" height="400" viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="400" rx="140" fill="url(#paint0_radial_1_3)"/><style>.main { font: 24px sans-serif; fill:',
          color1,
          '; }</style><text x="50%" y="176px" text-anchor="middle" class="main">',
          params.organization,
          '</text><text x="50%" y="206px" text-anchor="middle" class="main">',
          params.tokenName,
          '</text><text x="50%" y="236px" text-anchor="middle" class="main">',
          params.nickName
        ));
        // prettier-ignore
        return string(abi.encodePacked(
          output,
          '</text><defs><radialGradient id="paint0_radial_1_3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(150 200) rotate(90) scale(207 170)"><stop stop-color="',
          colorToString(rgb2),
          '"/><stop offset="1" stop-color="',
          color1,
          '"/></radialGradient></defs></svg>'
        ));
    }
}

/*
  Example of a completed SVG:
  
  <svg width="300" height="400" viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="400" rx="140" fill="url(#paint0_radial_1_3)"/>
  <style>
    .main { font: 24px sans-serif; fill: rgba(255, 210, 210, 1); }
  </style>
  <text x="50%" y="176px" text-anchor="middle" class="main">Organization</text>
  <text x="50%" y="206px" text-anchor="middle" class="main">Token Name</text>
  <text x="50%" y="236px" text-anchor="middle" class="main">Nickname</text>
  <defs>
    <radialGradient id="paint0_radial_1_3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(150 200) rotate(90) scale(207 154.334)">
      <stop stop-color="rgba(12, 22, 255, 1)"/>
      <stop offset="1" stop-color="rgba(255, 210, 210, 1)"/>
    </radialGradient>
  </defs>
  </svg>
*/
