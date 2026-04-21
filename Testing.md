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
10. **UpperBody/LowerBody Scan(Live Joint Angle Capture)** - Verify as the user moves their arms, the symmetry difference values in the info box update in real time quickly and accurately.
11. **UpperBody/LowerBody Scan(Repetition Counter)** - Verify when a user raises both arms overhead and then lowers them back down past the starting position, the rep counter increments. 
## Test Scripts 

```javascript
```
