document.addEventListener('DOMContentLoaded', function () {
    const doctors = {
        1: { name: 'Dr. Smith', specialty: 'Cardiologist', availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'] },
        2: { name: 'Dr. Brown', specialty: 'Dermatologist', availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'] }
    };

    let selectedDoctorId = null;
    let selectedDate = null;
    let selectedTime = null;
    const appointments = [];  // Array to store booked appointments

    let currentMonth = 4;  // May (0 = January, 11 = December)
    let currentYear = 2024;

    // Doctor Selection Logic
    const doctorCards = document.querySelectorAll('.select-doctor');
    doctorCards.forEach(card => {
        card.addEventListener('click', function () {
            selectedDoctorId = this.parentElement.getAttribute('data-doctor');
            showBookingPage(selectedDoctorId);
        });
    });

    // Show Booking Page
    function showBookingPage(doctorId) {
        document.querySelector('.doctor-list').style.display = 'none';
        document.querySelector('.booking-page').style.display = 'block';
        
        const doctor = doctors[doctorId];
        document.getElementById('doctor-name').textContent = doctor.name;
        document.getElementById('doctor-specialty').textContent = doctor.specialty;

        generateCalendar();
        generateTimeSlots(doctor.availableSlots);
    }

    // Generate Calendar
    function generateCalendar() {
        const dateContainer = document.querySelector('.dates');
        const monthName = document.querySelector('.month-name');

        dateContainer.innerHTML = ''; // Clear existing dates
        monthName.textContent = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // Get the day of the week the month starts on

        // Adjust for calendar starting on Monday instead of Sunday
        let blankDays = (firstDay === 0 ? 6 : firstDay - 1);

        for (let i = 0; i < blankDays; i++) {
            const blankDiv = document.createElement('div');
            blankDiv.className = 'date';
            dateContainer.appendChild(blankDiv);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'date';
            dateDiv.textContent = i;
            dateDiv.addEventListener('click', function () {
                document.querySelectorAll('.dates .date').forEach(btn => btn.classList.remove('selected'));
                this.classList.add('selected');
                selectedDate = i + ' ' + monthName.textContent;
                document.getElementById('selected-date').textContent = selectedDate;
                generateTimeSlots(doctors[selectedDoctorId].availableSlots); // Regenerate time slots for the selected date
            });
            dateContainer.appendChild(dateDiv);
        }
    }

    // Generate Time Slots
    function generateTimeSlots(slots) {
        const timeSlotsContainer = document.querySelector('.time-slots');
        timeSlotsContainer.innerHTML = '';  // Clear existing slots

        slots.forEach(slot => {
            const button = document.createElement('button');
            button.textContent = slot;

            // Check if the slot is already booked
            const isBooked = appointments.some(appt => 
                appt.doctorId == selectedDoctorId && appt.date == selectedDate && appt.time == slot
            );

            if (isBooked) {
                button.disabled = true;
                button.style.backgroundColor = 'red';  // Mark as booked
            } else {
                button.addEventListener('click', function () {
                    document.querySelectorAll('.time-slots button').forEach(btn => btn.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedTime = slot;
                });
            }

            timeSlotsContainer.appendChild(button);
        });
    }

    // Handle Month Navigation
    document.querySelector('.month-arrows span:first-child').addEventListener('click', function () {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        generateCalendar();
    });

    document.querySelector('.month-arrows span:last-child').addEventListener('click', function () {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        generateCalendar();
    });

    // Book Appointment
    const bookButton = document.querySelector('.book-appointment');
    bookButton.addEventListener('click', function () {
        if (selectedDate && selectedTime && selectedDoctorId) {
            // Check if the slot is already booked
            const isBooked = appointments.some(appt => 
                appt.doctorId == selectedDoctorId && appt.date == selectedDate && appt.time == selectedTime
            );

            if (isBooked) {
                alert("That time slot is already booked.");
            } else {
                // Book the appointment
                const newAppointment = {
                    doctorId: selectedDoctorId,
                    date: selectedDate,
                    time: selectedTime
                };
                appointments.push(newAppointment);

                const appointmentList = document.getElementById('appointment-list');
                const appointmentItem = document.createElement('li');
                const doctor = doctors[selectedDoctorId];
                appointmentItem.innerHTML = `${doctor.name} (${doctor.specialty}) - ${selectedDate} at ${selectedTime} <button class="clear-appointment">Clear</button>`;
                
                // Capture the appointment's details
                const apptDoctorId = newAppointment.doctorId;
                const apptDate = newAppointment.date;
                const apptTime = newAppointment.time;

                // Add Clear functionality with specific appointment details
                appointmentItem.querySelector('.clear-appointment').addEventListener('click', function () {
                    clearAppointment(apptDoctorId, apptDate, apptTime, appointmentItem);
                });
                
                appointmentList.appendChild(appointmentItem);

                showMainPage();
            }
        } else {
            alert("Please select a date and time.");
        }
    });

    // Clear Appointment Function
    function clearAppointment(doctorId, date, time, appointmentItem) {
        // Remove the appointment from the appointments array
        const index = appointments.findIndex(appt => 
            appt.doctorId == doctorId && appt.date == date && appt.time == time
        );
        if (index !== -1) {
            appointments.splice(index, 1);
        }

        // Remove the appointment from the view
        appointmentItem.remove();

        // If the booking page is currently displaying this doctor and date, regenerate the time slots
        if (selectedDoctorId == doctorId && selectedDate == date) {
            generateTimeSlots(doctors[selectedDoctorId].availableSlots);
        }
    }

    // Show Main Page
    function showMainPage() {
        document.querySelector('.booking-page').style.display = 'none';
        document.querySelector('.doctor-list').style.display = 'block';
        document.querySelector('.view-appointments').style.display = 'block';
    }

    // Back Button Logic
    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', function () {
        showMainPage();
    });
});
