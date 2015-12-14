var request = require('supertest');
var sinon = require('sinon');
var should = require('chai').should();
var config = require('../test_config.js');
var models = require('../../src/models');

var AccountModel = models.Account.AccountModel;

describe('controller', function() {
    
    //Function to test an HTTP response from supertest to make sure the return value was of type text/plain
    //We will check the headers from the supertest response
    var expectPlainText= function(res) {
        res.header['content-type'].should.equal('text/plain');
    };

    //Describe for grouping the tests for the make page
    describe('make', function() {
    
        //describe for grouping a successful make page call
        describe('successful make', function() {
    
            it('should return a 200', function(done) {

                request(app).get('/')
                .expect(200) //expect a 200 status code back from the server for this page
                .expect(expectPlainText) //call our function to expect a plaintext response
                .end(done);    //on end, call the done function to say this test is complete
            });
        
        });
        
        describe('failed make', function() {     

            var stub;

            before(function() {
                //create a stub of the PurchaseModel.prototype and manipulate the save function
                stub = sinon.stub(AccountModel.prototype, 'save');
                //create an error to be forced back from the save function
                var err = new Error("Could not save document");
                stub.yields(err); //force error            
            });
        
            it('should return a 500', function(done) {
                
                request(app).get('/')
                .expect(500) //expect a 500 error because we forced a server error to occur
                .expect(expectPlainText) //call our function to expect a plaintext response
                .end(done); //at the end call the done function to indicate this tests success
            });
            
            after(function(){    
                stub.restore();
            });
        });
    });
    
    //Describe for grouping the tests for the find page
    describe('find', function() {
    
        //describe for grouping a successful find page call
        describe('successful find', function(){
            
            //Tests to make sure a 200 status code returns upon going to the find page        
            it('should return a 200', function(done) {
                request(app).get('/find')
                .expect(200) //expect a 200 status code back from the server for this page
                .expect(expectPlainText) //call our function to check for a plaintext response
                .end(done); //on end call the done function to make the tests finish successfully
            });
        
        });
       
        describe('failed find', function() {
    
            var stub;
        
            before(function() {
                //create a stub of the PurchaseModel and manipulate the findByUsername function
                stub = sinon.stub(PurchaseModel, 'findMessages');
                stub.yields(null, null); //force null object                
            });

            it('should return a 404', function(done) {
                request(app).get('/find')
                .expect(404) //expect a 200 status code back from the server for this page
                .expect(expectPlainText) //call our function to test for a plaintext response
                .end(done); //when finished, call done the tell our code that the test was successful
            });

            after(function() 
                stub.restore();
            });
            
        });
    });
    
    //describe for grouping default route tests   
    describe('default routes', function() {

        //Test that a 404 error should return from a non-existent page
        it('should return a 404', function(done) {
            request(app).get('/notFound') 
            .expect(404) //expect a 404 response code
            .expect(expectPlainText) //expect response to by of type plaintext
            .end(done); //when finished, call the done function to indicate test success  
        });
    });

});