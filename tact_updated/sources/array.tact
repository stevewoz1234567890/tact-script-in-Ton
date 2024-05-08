import "@stdlib/deploy";

struct Array {
    map: map<Address, Bool>;
    length: Int = 0;
}
const MaxArraySize: Int = 5000;

extends fun append(self: Array, vip: Address, state: Bool) {
    require((self.length + 1) <= MaxArraySize, "No space in the array left for new items!");
    self.map.set(vip, state); 
    self.length += 1; 
}

extends fun deleteAll(self: Array) {
    self.map = emptyMap();
    self.length = 0;
}

extends fun getState(self: Array, usr: Address): Bool {
    require(self.length > 0, "No items in the array!");
    
    if (self.map.get(usr) == null) {
        return false;
    }

    return self.map.get(usr)!!;
}

fun emptyArray(): Array {
    return Array{map: emptyMap()}; // length defaults to 0
}