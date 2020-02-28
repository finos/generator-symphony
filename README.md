# generator-symphony
Yeoman based generator for Symphony Bots and Applications.

## Usage

```shell script
npm i generator-symphony --cli
yo symphony
```

## Development

### Running the generator

> This section is issued from [yeoman.io/authoring](https://yeoman.io/authoring/)

Since you’re developing the generator locally, it’s not yet available as a global npm module. 
A global module may be created and symlinked to a local one, using npm. Here’s what you’ll want to do:

On the command line, from the root of your generator project (in the generator-name/ folder), type:
```shell script
npm link
```

That will install your project dependencies and symlink a global module to your local file. 
After `npm link` is done, you’ll be able to call `yo symphony` and you should see the this.log, defined earlier, rendered in the terminal. 

A more convenient way to quickly test your changes is to execute the following command:
```shell script
npm run test:generate
```
That will generate your result inside a `dist/` folder located at the root of this project.