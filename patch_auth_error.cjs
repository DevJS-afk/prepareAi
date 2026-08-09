const fs = require('fs');

function patchFile(file) {
    let code = fs.readFileSync(file, 'utf8');
    const oldCode = `if (error) throw error;
    } catch (error: any) {
      console.error("Google Login Error:", error);
      setError(error.message);
      setLoading(false);
    }`;
    const newCode = `if (error) throw error;
    } catch (error: any) {
      console.error("Google Login Error:", error);
      if (error.message?.includes('popup-closed-by-user') || error.message?.includes('cancelled-popup-request') || error.code?.includes('popup-closed-by-user') || error.code?.includes('cancelled-popup-request')) {
         // Ignore cancelled popup
      } else {
         setError(error.message);
      }
      setLoading(false);
    }`;
    
    if (code.includes(oldCode)) {
        code = code.replace(oldCode, newCode);
        fs.writeFileSync(file, code);
        console.log("Patched " + file);
    } else {
        console.log("Could not find code in " + file);
    }
}

patchFile('src/components/LoginScreen.tsx');
patchFile('src/components/RegistrationScreen.tsx');
