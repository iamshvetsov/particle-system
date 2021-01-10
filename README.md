# particle-system
javascript particle system

|Parameter|Value|Description|
|-|-|-|
|isControllable|boolean|a world can only have one controllable system|
|coords|new Vector(number, number)|initial coords (value is changing when cursor keeps moving)|
|gravity|new Vector(number, number)|gravity vector|
|maxAmount|number|maximum amount of particles|
|creationAmount|number|generated amount of particles per tick|
|particleSize|number|initial size of particles (value is changing if shift key was pressed + scrolling)|
|scatter|number|scatter of particles (value is changing if alt key was pressed + scrolling)|