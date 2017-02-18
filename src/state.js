const State = Object.freeze( {
   HANDSHAKING: 0,
   STATUS     : 1,
   LOGIN      : 2,
   PLAY       : 3,


   toString: ( state ) => {
      switch( state ) {
         case State.HANDSHAKING: return 'handshaking';
         case State.STATUS     : return 'status';
         case State.LOGIN      : return 'login';
         case State.PLAY       : return 'play';
      }

      return `Unknown State #${state}`;
   }
} );

module.exports = State;
