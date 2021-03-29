# Tabletop Generator

A procedural generation for tabletop game terrain.

See LICENSE file for licensing details. If you have suggestions on alternative licensing then file an [issue](https://github.com/eaterofpies/tabletopgenerator/issues).

Use the latest stable version [here](https://eaterofpies.github.io/tabletopgen/).

This project uses [OpenJSCAD](https://github.com/jscad/OpenJSCAD.org).

## Basic Usage

- Enable instant update.
- Seed values control the damage patterns. Valid seeds are in the range of 0 to 2147483647.
- Set the desired number of bullet holes. Going over about 50 can be very slow.
- Increase the detail levels for 3d printing. Valid detail levels are in the range 0 - 8.
- Generate the STL and download the model.
- Add supports before printing depending on the amount of damage. Most bullet holes will print without supports.
