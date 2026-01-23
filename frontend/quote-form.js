// Quote submission via Formspree (instant, no backend wait)

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quoteFormNew');
    if (!form) return;

    const statusEl = document.getElementById('quoteStatus');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';

    // Formspree endpoint (replace YOUR_FORMSPREE_ID with your actual form ID)
    // Use email: team@meetcodeai.site when creating form (Cloudflare will forward to tonalmango@gmail.com)
    const FORMSPREE_URL = 'https://formspree.io/f/xwvlqwgw'; // ← Your Formspree form ID

    const setStatus = (message, type = 'info') => {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.style.display = 'block';
        statusEl.style.color = type === 'success' ? '#0f9d58' : '#d93025';
        console.log(`[Status] ${type.toUpperCase()}: ${message}`);
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('[Quote Form] Submit started');

        // Check if user is logged in
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            setStatus('⚠️ Please login to submit a quote request.', 'error');
            // Trigger login modal
            setTimeout(() => {
                const loginBtn = document.getElementById('loginBtn');
                if (loginBtn) loginBtn.click();
            }, 1500);
            return;
        }

        const selectedServices = Array.from(form.querySelectorAll('.service-checkbox:checked')).map(c => c.value);
        if (!selectedServices.length) {
            setStatus('Please select at least one service.', 'error');
            return;
        }

        // Prepare data for Formspree
        const payload = {
            name: form.querySelector('#quoteName')?.value?.trim(),
            email: form.querySelector('#quoteEmail')?.value?.trim(),
            company: form.querySelector('#quoteCompany')?.value?.trim(),
            budget: form.querySelector('#quoteBudget')?.value,
            timeline: form.querySelector('#quoteTimeline')?.value,
            details: form.querySelector('#quoteDetails')?.value || '',
            services: selectedServices.join(', ')
        };

        console.log('[Quote Form] Payload:', payload);

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '✨ Sending...';
        }

        try {
            console.log(`[Quote Form] Submitting to Formspree: ${FORMSPREE_URL}`);

            const response = await fetch(FORMSPREE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log('[Quote Form] Response received:', response.status);

            if (response.ok) {
                setStatus('✅ Thanks! We received your request. Check your email for confirmation.', 'success');
                form.reset();
            } else {
                setStatus(`Server error (${response.status}). Please try again.`, 'error');
            }
        } catch (err) {
            console.error('[Quote Form] Error:', err.name, err.message);
            setStatus('Network error: ' + (err.message || 'Unknown error'), 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
});
