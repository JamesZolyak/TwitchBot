var should = require('chai').should();

var config = require('./test_config.js');

describe("server", function() {

    it("should start up the server", function(done) {

        require('../src/app.js');
        
        app.should.not.be.an('undefined');
        
        //UPON SUCCESSFUL COMPLETION, YOU MUST CALL THE DONE CALLBACK FROM THIS IT FUNCTION
        done();
    });

});