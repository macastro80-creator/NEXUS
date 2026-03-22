const fs = require('fs');

// The OKR reporting happens in index.html (My Business OKR section) and the matchmaker modal is in my-desk.html / feed.
// Let's see how "Send Match" is handled in my-desk.html

let deskHtml = fs.readFileSync('my-desk.html', 'utf8');

// Looking for the "Send Match" button action. It probably calls showSuccessModal() with some text.
// "Feedback Requested", "The agent will receive a notification to fill out the feedback form"

// We need to inject a call to increment the OKR for "Matches Sent" across pages. Since OKR is stored locally or just UI right now, let's fire a generic localStorage event or a global function that the OKR dashboard could read.

deskHtml = deskHtml.replace(/showSuccessModal\("Feedback Requested"/, 
`// Log OKR
            let matches = parseInt(localStorage.getItem('okr_matches_sent') || '0');
            localStorage.setItem('okr_matches_sent', matches + 1);
            showSuccessModal("Feedback Requested"`);

fs.writeFileSync('my-desk.html', deskHtml, 'utf8');


// Also check index.html for match sending
let indexHtml = fs.readFileSync('index.html', 'utf8');
if (indexHtml.includes('showSuccessModal("Match Sent"')) {
    indexHtml = indexHtml.replace(/showSuccessModal\("Match Sent"/, 
    `let matches = parseInt(localStorage.getItem('okr_matches_sent') || '0');
                localStorage.setItem('okr_matches_sent', matches + 1);
                showSuccessModal("Match Sent"`);
    fs.writeFileSync('index.html', indexHtml, 'utf8');
}


// Now let's update my-business.html to read this localStorage value for "Matches Sent" (ACM or Matches)
if (fs.existsSync('my-business.html')) {
    let bizHtml = fs.readFileSync('my-business.html', 'utf8');
    
    // Find the OKR form where they enter matches sent manually, we can pre-fill it or show a live counter.
    // Replace <input type="number" id="okrACM" ... placeholder="0"> with a script that pulls from localStorage
    if (!bizHtml.includes('// Auto-fill OKR data')) {
        bizHtml = bizHtml.replace(/<\/body>/, 
`   <script>
        document.addEventListener('DOMContentLoaded', () => {
             // Auto-fill OKR data from actions taken in other pages
             const savedMatches = localStorage.getItem('okr_matches_sent');
             if (savedMatches) {
                 const acmInput = document.getElementById('okrACM');
                 if (acmInput) acmInput.value = savedMatches;
             }
        });
    </script>
</body>`);
        fs.writeFileSync('my-business.html', bizHtml, 'utf8');
    }
}

