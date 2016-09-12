# ecocat
remix my energy s project

#Installation

npm install -g ionic
npm install

#Run

ionic run android
ionic run android -l pour livereload

#Debug chrome

chrome://inspect/#devices

#Bug

Si bug avec le plugin facebbok :

ionic plugin rm phonegap-facebook-plugin
cordova plugin add https://github.com/Wizcorp/phonegap-facebook-plugin.git --variable APP_ID="1170260842991724" --variable APP_NAME="EcoCat"

Si bug Hash key facebook :

keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
password : android;

et me donné la key pour que je l'ajoute à facebook.







