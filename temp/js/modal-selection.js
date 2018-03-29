var simpleModal = document.getElementById('simpleModal');
var modalCloseButton = document.getElementById('modalCloseButton');

// Listen for the model close button click.
modalCloseButton.addEventListener('click', closeModal);
function closeModal() {
    hideModal();
}

// Listen for a click outside of the modal content, but inside the modal. Allow this click to close the modal.
window.addEventListener('click', insideModalOutsideContentClick);
function insideModalOutsideContentClick(e) {
    if (e.target == simpleModal) {
        hideModal();
    }
}

var pointOfInterestName = document.getElementById('pointOfInterestName');
var selectedPointAnnotation = document.getElementById('selectedPointAnnotation');
function showModal(name, description) {
    if (name !== undefined) {
        pointOfInterestName.value = name;
    }

    if (description !== undefined) {
        selectedPointAnnotation.value = description;
    }

    simpleModal.style.display = 'block';
}

function hideModal() {
    simpleModal.style.display = 'none';
}

var pointOfInterestAnnotationForm = document.getElementById('pointOfInterestAnnotationForm');
pointOfInterestAnnotationForm.addEventListener('submit', saveSimplePointOfInterestAnnotation);
function saveSimplePointOfInterestAnnotation(e) {
    var name = document.getElementById('pointOfInterestName').value;
    if(name !== "") {
        siteData.selectedSimplePointOfInterest.name = name;
    }
    var description = document.getElementById('selectedPointAnnotation').value;
    if(description !== "") {
        siteData.selectedSimplePointOfInterest.description = description;
    }

    saveStoredSelectedPoints();

    pointOfInterestAnnotationForm.reset();

    e.preventDefault();

    hideModal();
}