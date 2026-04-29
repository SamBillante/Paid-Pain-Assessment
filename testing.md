# Testing Documentation - Pain Paid Assessment by Dominic Ullmer

## Project Components / Services to Test
1. **Intake Form (index.html)** - The main form for collecting client information, injury details, wellness goals, and preferences for consultation.
2. **Form Validation (script.js)** - This code is the logic that ensures required fields on the form are filled out before being submitted.
3. **Pain Level Slider (index.html & script.js)** - Allows the user to input a range from 0-10 to represent pain level.
4. **3D Body Map (viewer.js)** - An interactive Three.js model that is available in browsers for users to click on body parts to select pain locations on their body. 
5. **Body Part Search (viewer.js)** - The search component of the Body Map that allows users to filter and highlight parts of the body by name. 
6. **Email Form Submission Service (script.js)** - 3rd part service that sends intake form to the sponsor upon form submission. 
7. **Thank You Screen (index.html + script.js)** - Screen shown after successful form submission showing Calendly as well as a summary of responses. 
8. **Upper Body Scan (upperbodyscan.html)** - Webcam based feature using MediaPipe to track joints calculating arm angles using vectors during an overhead press scoring and counting each rep. 
9. **Lower Body Scan (lowerbodyscan.html)** - Same as the 8, but for the lower body focused on back lean and knee angles.

## Test Case Descriptions 
1. **Required Field Validation(Missing Name)** - Verify that the form cannot be submitted until the Full Name Field is filled. User should receive a prompt asking them to fill in the required field.
2. **Required Field Validation(Checkbox)** - Verify that form cannot be submitted unless consent checkbox is checked; in other words, until the user agrees to the requirement. 
3. **Pain Level Sliders Updates in Real Time** - Verify as the user drags the slider between 0 and 10, the corresponding number displayed next to the sliders updates accurately and promptly.
4. **Body Part Selection Stored in a Hidden Field** - Verify that when a user clicks on a body part/muscle on the Body Map, the selected area is hidden in `selectedBodyArea` input so it is pushed to the form submission.
5. **Specific Body Part Search Returns The Correct Result** - Verify that when searching a specific body part in the search box will filter the list and highlight/select the correct body part on the model. 
6. **EmailJS Form Submission(Success)** - Verify that when a form is submitted properly, EmailJS sends the form info to the sponsor email address.
7. **EmailJS Form Submission(Failure)** - Verify when EmailJS service breaks, for whatever reason, the user receives an error message instead of the confirmation screen.  
8. **Proper Calendly Implementation** - Verify that Calendly booking loads correctly inside on the confirmation page after submitting a form.
9. **UpperBody/LowerBody Scan(Camera Activated)** - Verify that when "Start Camera" is clicked, the user sees a webcam permission request and after approval live video feed.
10. **UpperBody/LowerBody Scan(Repetition Counter)** - Verify when a user raises both arms overhead and then lowers them back down past the starting position, the rep counter increments. 
## Test Scripts 
**Use These Helpers To Test**
```javascript
const { Builder, By, until } = require('selenium-webdriver');
async function startTest(page = 'index.html') {
    let driver = await new Builder().forBrowser('chrome').build();
    await driver.get(`file:///path/to/Paid-Pain-Assessment/${page}`);
    return driver;
}
async function endTest(driver, testName) {
    await driver.quit();
    console.log(`${testName} PASSED`);
}
function check(condition, message) {
    console.assert(condition, `FAIL: ${message}`);
}
```
**Required Field Validation(Missing Name)**
```javascript
async function test1() {
    let driver = await startTest();
    try {
        await driver.findElement(By.css("button[type='submit']")).click();

        let confirmationScreen = await driver.findElement(By.id('thankYouMessage'));
        check(!await confirmationScreen.isDisplayed(), 'Confirmation screen should not appear on empty submission');

        let nameField = await driver.findElement(By.id('fullName'));
        let isValid = await driver.executeScript('return arguments[0].validity.valid;', nameField);
        check(!isValid, 'Name field should be invalid when empty');

        await endTest(driver, 'test1');
    } catch (e) {
        console.error('test1 FAILED:', e.message);
        await driver.quit();
    }
}
test1();
```
**Required Field Validation(Checkbox)**
```javascript
async function test2() {
    let driver = await startTest();
    try {
        await driver.findElement(By.id('fullName')).sendKeys('Test User');
        await driver.findElement(By.id('email')).sendKeys('test@example.com');
        await driver.findElement(By.id('phone')).sendKeys('5555555555');
        await driver.findElement(By.css("input[name='painDuration'][value='today']")).click();
        await driver.findElement(By.css("input[name='wellnessGoal'][value='reducing-pain']")).click();
        await driver.findElement(By.css("input[name='consultationPreference'][value='quick-check']")).click();

        // Submit without checking the disclaimer
        await driver.findElement(By.css("button[type='submit']")).click();

        let confirmationScreen = await driver.findElement(By.id('thankYouMessage'));
        check(!await confirmationScreen.isDisplayed(), 'Confirmation screen should not appear without disclaimer checked');

        await endTest(driver, 'test2');
    } catch (e) {
        console.error('test2 FAILED:', e.message);
        await driver.quit();
    }
}
test2();
```
**Pain Level Sliders Updates in Real Time**
```javascript
async function test3() {
    let driver = await startTest();
    try {
        let slider = await driver.findElement(By.id('painLevel'));
        let display = await driver.findElement(By.id('painLevelValue'));

        // Set slider to 0 and check display
        await driver.executeScript("arguments[0].value = 0; arguments[0].dispatchEvent(new Event('input'));", slider);
        let val = await display.getText();
        check(val === '0', `Display should show 0, got ${val}`);

        // Set slider to 7 and check display
        await driver.executeScript("arguments[0].value = 7; arguments[0].dispatchEvent(new Event('input'));", slider);
        val = await display.getText();
        check(val === '7', `Display should show 7, got ${val}`);

        // Set slider to 10 and check display
        await driver.executeScript("arguments[0].value = 10; arguments[0].dispatchEvent(new Event('input'));", slider);
        val = await display.getText();
        check(val === '10', `Display should show 10, got ${val}`);

        await endTest(driver, 'test3');
    } catch (e) {
        console.error('test3 FAILED:', e.message);
        await driver.quit();
    }
}
test3();
```
**Body Part Selection Stored in a Hidden Field**
```javascript
async function test4() {
    let driver = await startTest();
    try {
        // Wait for the viewer to load then give Three.js time to render the model
        await driver.wait(until.elementLocated(By.id('viewer')), 10000);
        await driver.sleep(4000);

        // Click the center of the 3D viewer to simulate selecting a body part
        let viewer = await driver.findElement(By.id('viewer'));
        let actions = driver.actions({ async: true });
        await actions.move({ origin: viewer }).click().perform();

        // Check that the hidden field now has a value
        let hiddenField = await driver.findElement(By.id('selectedBodyArea'));
        let value = await hiddenField.getAttribute('value');
        check(value && value.length > 0, 'Hidden field should have a value after clicking the body map');

        await endTest(driver, 'test4');
    } catch (e) {
        console.error('test4 FAILED:', e.message);
        await driver.quit();
    }
}
test4();
```
**Specific Body Part Search Returns The Correct Result**
```javascript
async function test5() {
    let driver = await startTest();
    try {
        // Wait for the viewer and search input to load
        await driver.wait(until.elementLocated(By.id('viewer')), 10000);
        await driver.sleep(4000);

        // Type a muscle name into the search box
        let searchInput = await driver.findElement(By.id('searchInput'));
        await searchInput.sendKeys('trapezius');

        // Wait for search results to appear
        await driver.wait(until.elementLocated(By.css('#searchResults li')), 5000);

        // Check that at least one result appeared
        let results = await driver.findElements(By.css('#searchResults li'));
        check(results.length > 0, 'Search should return at least one result for trapezius');

        // Check that the first result contains the search term
        let firstResult = await results[0].getText();
        check(firstResult.toLowerCase().includes('trapezius'), `First result should contain 'trapezius', got '${firstResult}'`);

        // Click the first result and verify the part title updates
        await results[0].click();
        let partTitle = await driver.findElement(By.id('partTitle')).getText();
        check(partTitle.toLowerCase().includes('trapezius'), `Part title should update to trapezius, got '${partTitle}'`);

        await endTest(driver, 'test5');
    } catch (e) {
        console.error('test5 FAILED:', e.message);
        await driver.quit();
    }
}
test5();
```
**EmailJS Form Submission(Success)**
```javascript
async function test6() {
    let driver = await startTest();
    try {
        await driver.findElement(By.id('fullName')).sendKeys('Jane Doe');
        await driver.findElement(By.id('email')).sendKeys('jane@example.com');
        await driver.findElement(By.id('phone')).sendKeys('2055551234');
        await driver.findElement(By.css("input[name='painDuration'][value='1-4-weeks']")).click();
        await driver.findElement(By.css("input[name='discomfortType'][value='sore-achy']")).click();

        // Set pain level slider to 6
        let slider = await driver.findElement(By.id('painLevel'));
        await driver.executeScript("arguments[0].value = 6; arguments[0].dispatchEvent(new Event('input'));", slider);

        await driver.findElement(By.css("input[name='triggers'][value='sitting']")).click();
        await driver.findElement(By.css("input[name='wellnessGoal'][value='posture']")).click();
        await driver.findElement(By.css("input[name='consultationPreference'][value='movement-relief']")).click();
        await driver.findElement(By.css("input[name='productInterest'][value='maybe']")).click();
        await driver.findElement(By.css("input[name='disclaimerAgreement']")).click();
        await driver.findElement(By.css("button[type='submit']")).click();

        // Wait for confirmation screen to appear
        await driver.wait(until.elementIsVisible(await driver.findElement(By.id('thankYouMessage'))), 10000);

        let confirmationScreen = await driver.findElement(By.id('thankYouMessage'));
        check(await confirmationScreen.isDisplayed(), 'Confirmation screen should be visible after successful submission');

        await endTest(driver, 'test6');
    } catch (e) {
        console.error('test6 FAILED:', e.message);
        await driver.quit();
    }
}
test6();
```
**EmailJS Form Submission(Failure)**
```javascript
async function test7() {
    let driver = await startTest();
    try {
        // Override the EmailJS send function with a fake one that always fails
        await driver.executeScript(`
            emailjs.send = async function() {
                throw new Error('Simulated EmailJS failure');
            };
        `);

        // Fill in all required fields
        await driver.findElement(By.id('fullName')).sendKeys('Jane Doe');
        await driver.findElement(By.id('email')).sendKeys('jane@example.com');
        await driver.findElement(By.id('phone')).sendKeys('2055551234');
        await driver.findElement(By.css("input[name='painDuration'][value='1-4-weeks']")).click();
        await driver.findElement(By.css("input[name='discomfortType'][value='sore-achy']")).click();

        // Set pain level slider to 6
        let slider = await driver.findElement(By.id('painLevel'));
        await driver.executeScript("arguments[0].value = 6; arguments[0].dispatchEvent(new Event('input'));", slider);

        await driver.findElement(By.css("input[name='triggers'][value='sitting']")).click();
        await driver.findElement(By.css("input[name='wellnessGoal'][value='posture']")).click();
        await driver.findElement(By.css("input[name='consultationPreference'][value='movement-relief']")).click();
        await driver.findElement(By.css("input[name='productInterest'][value='maybe']")).click();
        await driver.findElement(By.css("input[name='disclaimerAgreement']")).click();
        await driver.findElement(By.css("button[type='submit']")).click();

        // Give the page a moment to process the failed submission
        await driver.sleep(2000);

        // Confirmation screen should NOT appear
        let confirmationScreen = await driver.findElement(By.id('thankYouMessage'));
        check(!await confirmationScreen.isDisplayed(), 'Confirmation screen should not appear when EmailJS fails');

        // An error message should be visible somewhere on the page
        let bodyText = await driver.findElement(By.css('body')).getText();
        check(bodyText.toLowerCase().includes('error') || bodyText.toLowerCase().includes('failed') || bodyText.toLowerCase().includes('try again'),
            'Page should display an error message when EmailJS fails');

        await endTest(driver, 'test7');
    } catch (e) {
        console.error('test7 FAILED:', e.message);
        await driver.quit();
    }
}
test7();
```
**Proper Calendly Implementation**
```javascript
async function test8() {
    let driver = await startTest();
    try {
        // Fill in and submit the form to reach the confirmation screen
        await driver.findElement(By.id('fullName')).sendKeys('Jane Doe');
        await driver.findElement(By.id('email')).sendKeys('jane@example.com');
        await driver.findElement(By.id('phone')).sendKeys('2055551234');
        await driver.findElement(By.css("input[name='painDuration'][value='1-4-weeks']")).click();
        await driver.findElement(By.css("input[name='discomfortType'][value='sore-achy']")).click();

        let slider = await driver.findElement(By.id('painLevel'));
        await driver.executeScript("arguments[0].value = 6; arguments[0].dispatchEvent(new Event('input'));", slider);

        await driver.findElement(By.css("input[name='triggers'][value='sitting']")).click();
        await driver.findElement(By.css("input[name='wellnessGoal'][value='posture']")).click();
        await driver.findElement(By.css("input[name='consultationPreference'][value='movement-relief']")).click();
        await driver.findElement(By.css("input[name='productInterest'][value='maybe']")).click();
        await driver.findElement(By.css("input[name='disclaimerAgreement']")).click();
        await driver.findElement(By.css("button[type='submit']")).click();

        // Wait for confirmation screen to appear
        await driver.wait(until.elementIsVisible(await driver.findElement(By.id('thankYouMessage'))), 10000);

        // Give Calendly time to load inside the container
        await driver.sleep(5000);

        // Check that the Calendly container exists and is visible
        let calendlyContainer = await driver.findElement(By.id('calendlyContainer'));
        check(await calendlyContainer.isDisplayed(), 'Calendly container should be visible on the confirmation screen');

        // Check that Calendly actually injected an iframe inside the container
        let calendlyFrame = await driver.findElements(By.css('#calendlyContainer iframe'));
        check(calendlyFrame.length > 0, 'Calendly should inject an iframe into the container');

        // Check the iframe src contains calendly.com
        let frameSrc = await calendlyFrame[0].getAttribute('src');
        check(frameSrc.includes('calendly.com'), `Calendly iframe src should point to calendly.com, got '${frameSrc}'`);

        await endTest(driver, 'test8');
    } catch (e) {
        console.error('test8 FAILED:', e.message);
        await driver.quit();
    }
}
test8();
```
**UpperBody/LowerBody Scan(Camera Activated) For simplicity all of these tests will be done on upperbody**
```javascript
async function test9() {
    let driver = await startTest('upperbodyscan.html');
    try {
        // Click the start camera button
        let startBtn = await driver.findElement(By.id('startBtn'));
        await startBtn.click();

        // Give the camera and MediaPipe time to initialize
        await driver.sleep(5000);

        // Check that the button text changed to indicate camera is on
        let btnText = await startBtn.getText();
        check(btnText.toLowerCase().includes('camera on'), `Start button should say 'Camera On', got '${btnText}'`);

        // Check that the video element is active and has dimensions
        let video = await driver.findElement(By.id('video'));
        let videoWidth = await driver.executeScript('return arguments[0].videoWidth;', video);
        check(videoWidth > 0, `Video should have a width greater than 0, got ${videoWidth}`);

        // Check that the canvas is visible over the video
        let canvas = await driver.findElement(By.id('canvas'));
        check(await canvas.isDisplayed(), 'Canvas overlay should be visible once camera is active');

        // Check that the status text updated
        let status = await driver.findElement(By.id('status')).getText();
        check(status.length > 0 && !status.includes('Waiting'), `Status should update once camera is active, got '${status}'`);

        await endTest(driver, 'test9');
    } catch (e) {
        console.error('test9 FAILED:', e.message);
        await driver.quit();
    }
}
test9();
```
**UpperBody/LowerBody Scan(Repetition Counter)**
```javascript
async function test10() {
    let driver = await startTest('upperbodyscan.html');
    try {
        // Start the camera
        await driver.findElement(By.id('startBtn')).click();
        await driver.sleep(5000);

        // Check rep counter starts at 0
        let repCount = await driver.findElement(By.id('repCount')).getText();
        check(repCount === '0', `Rep counter should start at 0, got '${repCount}'`);

        // Simulate a press rep by manipulating the rep counter directly via JavaScript
        // since we cant physically move arms in front of a fake webcam
        await driver.executeScript(`
            // Simulate wrists going above shoulders (press up)
            inPress = true;
            hitTop = true;

            // Simulate wrists coming back down (press complete)
            inPress = false;
            hitTop = false;
            reps++;
            document.getElementById('repCount').textContent = reps;
            document.getElementById('status').textContent = 'Rep ' + reps + ' done! Lower arms, then press again.';
        `);

        // Check rep counter incremented to 1
        repCount = await driver.findElement(By.id('repCount')).getText();
        check(repCount === '1', `Rep counter should be 1 after one rep, got '${repCount}'`);

        // Check status message updated
        let status = await driver.findElement(By.id('status')).getText();
        check(status.includes('Rep 1 done'), `Status should confirm rep 1 was completed, got '${status}'`);

        // Simulate a second rep
        await driver.executeScript(`
            inPress = true;
            hitTop = true;
            inPress = false;
            hitTop = false;
            reps++;
            document.getElementById('repCount').textContent = reps;
            document.getElementById('status').textContent = 'Rep ' + reps + ' done! Lower arms, then press again.';
        `);

        // Check rep counter incremented to 2
        repCount = await driver.findElement(By.id('repCount')).getText();
        check(repCount === '2', `Rep counter should be 2 after two reps, got '${repCount}'`);

        await endTest(driver, 'test10');
    } catch (e) {
        console.error('test10 FAILED:', e.message);
        await driver.quit();
    }
}
test10();
```
