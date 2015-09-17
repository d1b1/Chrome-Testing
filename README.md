### Chrome Extension to Allow JQuery Testing

This project is a POC to build out a Chrome extension to build basic
UI changes into a squence that can be used to build a script or functional
test. Most testing patterns in development teams are 'developer' focused, with
QA teams falling back to manual testing. This is an effort to provide inbrowser
tools to build `programmable` assertions to speed up manual testing of UIs.

### Limitations
* Crossing domains or changing the URL will break the test.
* Storage - tests are stored in `localStorage`, so are not yet easily portable.

### To-Do
* Add in expect.js or should library to make assertions more common.
* Add in better structure for each assertion; change, expect and action.
* Add Angular to allow better UI control and state.
* Add save to localStorage after CRUD and drag and drop.
* Add mapable Hotkeys to allow rapid running of test suites.
* Add Mouseover to show specific options: run, edit, delete, copy.
* Add Double click to edit a given test.
* Add hightlighting to show the movement of the focus in the browser.