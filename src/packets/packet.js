const varint = require( 'varint' );

class Packet {
   constructor( state, id ) {
      this.state = state;
      this.id    = id;
   }

   createPacket( data ) {
      return Buffer.concat( [
         Buffer.from( varint.encode( varint.encodingLength( this.id ) + data.length ) ),
         Buffer.from( varint.encode( this.id ) ),
         data
      ] );
   }

   static decode( buffer ) {
      let offset = 0;

      let length = varint.decode( buffer );
      offset += varint.decode.bytes;

      let id = varint.decode( buffer, offset );
      offset += varint.decode.bytes;

      let packet = buffer.slice( offset, buffer.length );

      return { length, id, packet };
   }
}

module.exports = Packet;
