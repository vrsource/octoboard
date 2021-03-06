describe( 'GitHub API (gh)', function() {
   function clearStorage() {
      localStorage.clear();
      sessionStorage.clear();
   }

   // Make sure the modules under test are loaded
   beforeEach( module('github.api') );

   beforeEach(inject(function($httpBackend) {
      // Start with local and session storage empty (ie. isolate the tests)
      clearStorage();
   }));

   it('should start without a token', inject( function(gh) {
      expect( gh.hasAccessToken() ).not.toBeTruthy();
   }));

   describe( 'setAccessToken', function() {
      it('should allow setting the key in memory only', inject( function(gh) {
         // When the access token is set with a storage plan
         gh.setAccessToken('my token');
         // Then the token is available for use
         expect( gh.hasAccessToken() ).toBeTruthy();
         // And the token is not stored in storage
         expect( localStorage.getItem('gh-token') ).toBeNull();
         expect( sessionStorage.getItem('gh-token') ).toBeNull();
      }));

      it('should allow setting the key in session storage', inject(function(gh) {
         // When the access token is set with a storage plan
         gh.setAccessToken('my token', 'session');
         // Then the token is available for use
         expect( gh.hasAccessToken() ).toBeTruthy();
         // And the token is not stored in local storage
         expect( localStorage.getItem('gh-token') ).toBeNull();
         // And the token should be stored in session storage
         expect( sessionStorage.getItem('gh-token') ).toEqual('my token');
      }));

      it('should allow setting the key in local storage', inject(function(gh) {
         // When the access token is set with a storage plan
         gh.setAccessToken('my token', 'local');
         // Then the token is available for use
         expect( gh.hasAccessToken() ).toBeTruthy();
         // And the token should not be stored in session storage
         expect( sessionStorage.getItem('gh-token') ).toBeNull();
         // And the token is stored in local storage
         expect( localStorage.getItem('gh-token') ).toEqual('my token');
      }));
   });

   describe('Repo Listing', function() {
      // XXX these tests are weak but since we just dump the API results back
      // to the caller all that we care about is that the URL is built correctly.
      beforeEach(inject(function(gh) {
         gh.setAccessToken('sometoken');
      }));

      it('should allow getting the list of repositories', inject(function(gh, $httpBackend) {
         // Given the GitHub API returns no issues
         $httpBackend.expectGET('https://api.github.com/repos/dude/where/issues?access_token=sometoken').
            respond([]);

         // When the list is requested
         var res = gh.listRepoIssues('dude', 'where').then(function(issues) {
            expect( issues ).toEqual( [] );
         });
         $httpBackend.flush();
      }));

      it('should allow getting a file', inject(function(gh, $httpBackend) {
         // Given the GitHub API returns the file
         $httpBackend.expectGET('https://api.github.com/repos/dude/where/contents/file.txt?access_token=sometoken').
            respond({content: 'aGVsbG8gd29ybGQ='});

         // When the list is requested
         var res = gh.getFile('dude', 'where', 'file.txt').then(function(content) {
            expect( content ).toEqual( 'hello world' );
         });
         $httpBackend.flush();
      }));
   });
});
