3D Human Body Model Viewer
    This program allows the user view a model of the human body in 3 dimensions
    The user can zoom in and out and rotate around the model
    Selection of any body part will initiate a zoom towards the selected part and the window below to display both the part's name and the common diagnoses for the region of the body it belongs to
Organization
        - viewer.js - main logic
        - index.html - frontend
        - assets
             | - human-body.glb - blender file containing muscle model
Execution
    local:
        python -m http:server
    mobile:
        ngrok http 3000
        npx serve . 