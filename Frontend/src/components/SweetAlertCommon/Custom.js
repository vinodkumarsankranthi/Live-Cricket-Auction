import Swal from "sweetalert2";
import './custom.css';

// Define a custom alert function
export function customAlert(title, text, icon) {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon, // Change the icon as needed (success, error, warning, info)
        confirmButtonText: 'OK',
        confirmButtonColor: '#2e7d32', // Custom button color
        background: '#f3f3f3', // Custom background color
        customClass: {
            container: 'my-custom-container-class', // Custom container class
            title: 'my-custom-title-class', // Custom title class
            content: 'my-custom-content-class', // Custom content class
            confirmButton: 'my-custom-button-class' // Custom button class
        }});
}
