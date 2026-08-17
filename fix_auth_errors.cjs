const fs = require('fs');

function patchFile(file, contextStr) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace the catch block
    const oldCatch = `    } catch (error: any) {
      console.error("${contextStr}", error);
      if (error.message?.includes('popup-closed-by-user') || error.message?.includes('cancelled-popup-request') || error.code?.includes('popup-closed-by-user') || error.code?.includes('cancelled-popup-request')) {
         // Ignore cancelled popup
      } else {
         setError(error.message);
      }
      setLoading(false);
    }`;

    const newCatch = `    } catch (error: any) {
      const isPopupClosed = error?.message?.includes('popup-closed-by-user') || 
                           error?.message?.includes('cancelled-popup-request') || 
                           error?.code?.includes('popup-closed-by-user') || 
                           error?.code?.includes('cancelled-popup-request') ||
                           String(error).includes('popup-closed-by-user') ||
                           String(error).includes('cancelled-popup-request');
                           
      if (!isPopupClosed) {
         console.error("${contextStr}", error);
         setError(error?.message || String(error));
      }
      setLoading(false);
    }`;

    if (code.includes(oldCatch)) {
        code = code.replace(oldCatch, newCatch);
        fs.writeFileSync(file, code);
        console.log("Patched " + file);
    } else {
        console.log("Could not find catch block in " + file);
    }
}

patchFile('src/components/LoginScreen.tsx', 'Google Login Error:');
patchFile('src/components/RegistrationScreen.tsx', 'Google Signup Error:');
