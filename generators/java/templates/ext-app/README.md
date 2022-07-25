## Extension App Example
This project is a simple complete example of a Symphony Extension App, comprising backend and frontend components.

## Configuration
If you have filled in the Generator with valid answers, the project is ready to go.
To change these answers, please revise the configuration file located at [src/main/resources/application.yaml](src/main/resources/application.yaml).

If you have changed the `appId`, please also change the values accordingly in the frontend components located in `src/main/resources/static/scripts`:
- [app.js](src/main/resources/static/scripts/app.js)
- [controller.js](src/main/resources/static/scripts/controller.js)

Alternatively, run the generator again and revise your answers.

## Getting Started
### Using your company's pod
1. Request your pod administrator to create an extension app in the Admin & Compliance Portal
2. Supply them with an `appId` and a *public key*
3. Ensure that the `appId` and *private key* in [application.yaml](src/main/resources/application.yaml) matches the pair above

### Using the Developer Sandbox
1. Use the shared `appId`: `localhost-10443`
2. Download the [shared private key](https://localhost-10443.vercel.app/privatekey.pem) and use it to replace [rsa/privatekey.pem](rsa/privatekey.pem)

## Run the Project
### Using IDE:
Load the project in your preferred IDE and launch the main class: `ExtensionAppApplication`
### Using CLI:
```bash
$ ./mvnw spring-boot:run
```

## Run the Extension App
1. Once the backend is up and running, visit https://localhost:10443/controller.html in a Chrome browser and bypass any security warnings.
This is only for development purposes and you will be expected to deploy the production application on a server with a trusted TLS certificate.
2. Launch Symphony in the same browser and sign in. For the developer sandbox, that would be: https://develop2.symphony.com.
3. Click on the **Marketplace** icon on the bottom left rail
4. Search for your application name (the shared sandbox app is named **Localhost 10443**)
5. Click Install
6. You should now see a new listing under **Apps** named *Circle of Trust*, which you can click to launch

## Build your Extension App
Start building your own app by editing `controller.js` and `app.js`.
You can review the [Extension API documentation](https://docs.developers.symphony.com/building-extension-applications-on-symphony/overview-of-extension-api/extension-api-services)
to find out more about the frontend services available.

You can also add backend functionality in the main project, which already includes the Bot Developer Kit.
You can review the [REST API reference](https://developers.symphony.com/restapi/reference) to find out more about backend services available.

## Troubleshooting
* Use the Chrome Developer Tools to inspect any errors in the Console or Network tabs
* Ensure that the `appId` and *private key* used are valid, matching the entries created in the pod
* Ensure that you have manually visited https://localhost:10443 to bypass the security warnings before attempting to load the extension app in Symphony

## Community Support
If you have any questions, please reach out on the developer forum at [forum.developers.symphony.com](https://forum.developers.symphony.com).
