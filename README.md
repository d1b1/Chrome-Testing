### Chrome Extension to Allow JQuery Testing

This project is a POC to build out a Chrome extension to build basic
UI changes into a squence that can be used to build a script or functional
test. 

### Limitations
* Crossing domains or changing the URL will break the test.
* Storage - tests are stored in `localStorage`, so are not yet easily portable.

### To-Do
* Add in expect.js or should library to make assertions more common.
* Add in better structure for each assertion; change, expect and action.