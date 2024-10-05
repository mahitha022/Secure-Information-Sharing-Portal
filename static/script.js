document.getElementById('openButton').addEventListener('click', async () => {
    const password = document.getElementById('password').value;

    if (!password) {
        alert('Please enter a password.');
        return; // Prevent proceeding if password is missing
    }

    try {
        // Derive the same password hash as when saving
        const staticSalt = new TextEncoder().encode('static_salt');
        const passwordHashKey = await deriveKey(password, staticSalt);
        const hashArray = new Uint8Array(await crypto.subtle.exportKey("raw", passwordHashKey));
        const passwordHashString = btoa(String.fromCharCode(...hashArray));

        // Call the server with the derived password hash
        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password_hash: passwordHashString }),  // Use the correct hash
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('dataContainer').style.display = 'block';
            if (result.ciphertext) {
                document.getElementById('info').value = await decryptData(password, result.salt, result.iv, result.ciphertext);
            } else {
                document.getElementById('info').value = '';  // No info found
            }
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});


// Handle "Enter" key press in password input
document.getElementById('password').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('openButton').click();
    }
});

// Derive key using PBKDF2 with a Uint8Array salt
async function deriveKey(password, salt) {
    const baseKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password), // Password encoded as bytes
        { name: 'PBKDF2' },
        false, // Must be false for KDF keys
        ['deriveKey'] // Only allow this base key for derivation
    );

    // Ensure salt is a BufferSource (Uint8Array)
    const saltBuffer = typeof salt === 'string' ? new TextEncoder().encode(salt) : salt;

    // Derive an AES-GCM key
    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: 100000,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        true, // Set this key as extractable if needed for export
        ['encrypt', 'decrypt']
    );
}

// Encrypt data using AES-GCM
async function encryptData(password, info) {
    const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate a random salt
    const key = await deriveKey(password, salt); // Derive the encryption key

    const iv = crypto.getRandomValues(new Uint8Array(12)); // Random IV for AES-GCM
    const enc = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        enc.encode(info)
    );

    // Log values to check during decryption
    //console.log("Encryption - Salt: ", salt);
    //console.log("Encryption - IV: ", iv);

    return {
        salt: btoa(String.fromCharCode(...salt)),
        iv: btoa(String.fromCharCode(...iv)),
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    };
}
async function decryptData(password, salt, iv, ciphertext) {
    //console.log("Starting decryption...");
    //console.log("Password:", password);
    //console.log("Salt:", salt);
    //console.log("IV:", iv);
    //console.log("Ciphertext:", ciphertext);

    const key = await deriveKey(password, Uint8Array.from(atob(salt), c => c.charCodeAt(0)));
    const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    const encData = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

    //console.log("Derived Key for Decryption:", new Uint8Array(await crypto.subtle.exportKey("raw", key)));
    //console.log("IV Array:", ivArray);
    //console.log("Encrypted Data:", encData);

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivArray },
        key,
        encData
    );

    const dec = new TextDecoder();
    const decryptedText = dec.decode(decrypted);
    //console.log("Decrypted Text:", decryptedText);
    return decryptedText;
}


// Handle save operation
document.getElementById('saveButton').addEventListener('click', async () => {
    const password = document.getElementById('password').value;
    const info = document.getElementById('info').value;

    if (!password) {
        alert('Please enter a password.');
        return;
    }

    const encryptedData = await encryptData(password, info);

    // Correctly use Uint8Array for static salt
    const staticSalt = new TextEncoder().encode('static_salt');
    const passwordHash = await deriveKey(password, staticSalt);
    const hashArray = new Uint8Array(await crypto.subtle.exportKey("raw", passwordHash));
    const passwordHashString = btoa(String.fromCharCode(...hashArray));

    const response = await fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            password_hash: passwordHashString,
            salt: encryptedData.salt,
            iv: encryptedData.iv,
            ciphertext: encryptedData.ciphertext
        })
    });

    const result = await response.json();
    if (response.ok) {
        alert(result.success);
        document.getElementById('password').value = '';
        document.getElementById('info').value = '';
        document.getElementById('dataContainer').style.display = 'none';
        window.location.href = '/';
    } else {
        alert('Error: ' + result.error);
    }
});
