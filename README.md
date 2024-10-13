<h2 align="center">React Extract Colors</h2>

<div align="center">
   <p align="center">A react hook to extract dominant colors from an image 🎨<br>
    </p>
   <p align="center">
      <a href="https://github.com/JesusAguilarAliaga/react-extract-colors"><b>Github</b></a> •
      <a href="https://react-extract-colors.netlify.app/"><b>Examples(Documentation)</b></a>
   </p>
   <img src="https://i.imgur.com/MfezyZT.jpg">
   <br>
</div>

<h3 align="center">
   Installation 🚀
</h3>

<p align="center">Get started with these simple installation steps.</p>

###### Using npm

```bash
npm install react-extract-colors
```

###### Using yarn

```bash
yarn add react-extract-colors
```

###### Using pnpm

```bash
pnpm add react-extract-colors
```

Once the package is installed, you can import the library using `import` approach:

```js
import { useExtractColors } from "react-extract-colors";
```

<h3 align="center">
   Usage 👨‍💻
</h3>

- mainly supported image formats: (`png, jpg, jpeg, svg, gif and more...`)

When you have an image and you want to extract the dominant color, you can use the hook. The hook returns an object containing various properties.

If you only need the dominant color, you can use the `dominantColor` property.

You can also get the darker and lighter variants to create a grandient color.

```js
import { useExtractColors } from "react-extract-colors";

const image = "https://picsum.photos/id/237/200/300";

const { colors, dominantColor, darkerColor, lighterColor, loading, error } =
  useExtractColors(image);
```

##### Properties 📊

| Property        | Description                                 |
| :-------------- | :------------------------------------------ |
| `colors`        | An array containing the top dominant colors |
| `dominantColor` | The dominant color of the image             |
| `darkerColor`   | A darker variant of the dominant color      |
| `lighterColor`  | A lighter variant of the dominant color     |
| `loading`       | Indicates whether the image is loading      |
| `error`         | Indicates whether the image has an error    |

<h3 align="center">
   Example 🌟
</h3>

Explore a basic example to understand its usage, you can utilize it in various ways.

```js
// import the hook
import { useExtractColors } from "react-extract-colors";

const image = "https://picsum.photos/id/237/200/300";

const App = () => {
  // Use the hook to extract the dominant color
  const { dominantColor, darkerColor, lighterColor } = useExtractColors(image);

  return (
    // set a linear gradient with colors extracted
    <div
      style={{
        backgroundColor: `linear-gradient(45deg, ${dominantColor}, ${darkerColor}, ${lighterColor})`,
      }}
    >
      <h1>Extract Color</h1>
      <img src={image} alt="random image" width="200" height="300" />
    </div>
  );
};

export default App;
```

<h4 align="center">
   Example with settings ⚙️
</h4>

You can also pass settings to the hook, to customize the extraction process.

> **Note:** passing settings to the hook is an optional step.

```js
// import the hook
import { useExtractColors } from "react-extract-colors";

const image = "https://picsum.photos/id/237/200/300";

const App = () => {
  // Use the hook to extract the dominant color
  const { colors } = useExtractColors(image, {
    maxColors: 3,
    format: "hex",
    maxSize: 200,
    orderBy: "vibrance",
  });

  const [color1, color2, color3] = colors;

  return (
    // set the background color to the dominant color
    <div style={{ border: `1px solid ${color1}` }}>
      <h1 style={{ color: color3 }}>Extract Color</h1>
      <img src={image} alt="random image" width="200" height="300" />
    </div>
  );
};

export default App;
```

<h3 align="center">
   Settings ⚙️
</h3>

#### maxColors:

The maxColors parameter determines the number of colors to be included in the `colors` array. When you provide an image to the hook, it extracts and counts the colors, returning the most dominant ones based on the specified limit.

> **Note:** While you can retrieve more colors than the recommended limit, use this feature judiciously as its effectiveness varies with each image.

#### format:

You can specify the color format using one of the following options: `rgba`, `rgb`, `hex`, `hsl`, or `hsv`.

#### maxSize:

The maxSize is the size at which the image will be processed to extract colors. The smaller the size, the faster the processing may be, but it affects color accuracy to some extent. If you need more precision, you can set a higher value at the expense of sacrificing some speed.

#### colorSimilarityThreshold:

The `colorSimilarityThreshold` parameter defines the minimum similarity between colors to be considered identical. If you want to avoid retrieving colors that look very similar, you can adjust this value. A threshold of `0` will return all detected colors without filtering for similarity.

#### sortBy:

The `sortBy` parameter controls the sorting of the returned colors. You can select from the following options:

- **`vibrance`**: Sorts colors by brightness, giving priority to the most vibrant ones.
- **`dominance`**: Sorts colors based on how frequently they appear in the image.

| Parameter                  | Type     | Description                                                                         | Options (recommended)          |
| :------------------------- | :------- | :---------------------------------------------------------------------------------- | :----------------------------- |
| `maxColors`                | `number` | Number of colors to get in the `colors` array **default: 3**                        | 0-100                          |
| `format`                   | `string` | Format to get the colors **default: rgba**                                          | `rgba` `rgb` `hex` `hsl` `hsv` |
| `maxSize`                  | `number` | Size to extract the colors **default: 18**                                          | 0-500                          |
| `colorSimilarityThreshold` | `number` | Minimum similarity threshold for colors to be considered identical. **default: 50** | 0-500                          |
| `sortBy`                   | `string` | Determines the sorting method for the returned colors **default: dominance**        | `vibrance` `dominance`         |

<h3 align="center">
   Credits  🙌
</h3>

The React Extract Colors hook was created by [Jesús Aguilar](https://github.com/JesusAguilarAliaga)

<h3 align="center">
   License 📝
</h3>

Licensed under the [MIT License](LICENSE.md) - see the [LICENSE.md](LICENSE.md) file for details.
