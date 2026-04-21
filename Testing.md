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
## Test Scripts 
