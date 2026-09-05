# UI Styling

## Tokens and themes

- Define colors, typography, spacing, radii, shadows, and animation timings as design tokens.
- A feature component must not copy a shared color or screen spacing value.
- Mobile and desktop may use different theme implementations while sharing semantic token names such as `surface`, `contentPrimary`, `danger`, and `focusRing`.
- Select and export one styling adapter per platform; features must not import competing styling systems.

## Layout

- Use a 4 px spatial grid; dimensions and spacing should normally be multiples of four.
- Typography may leave the grid for readability and platform font metrics.
- Use container `gap` for repeated layouts; an item does not own spacing to its siblings.
- In a regular vertical flow, the later element owns its top spacing unless a documented constraint requires otherwise.
- Pages and widget containers own outer padding, safe areas, and desktop window insets. Presentational children do not guess their screen position.
- Meet platform touch-target minimums independently of visible icon size.

## States and variants

- Model visual states as named variants such as `idle`, `selected`, `disabled`, and `error`.
- Put shared values in the base style and only differences in the variant.
- Do not build a hidden variant system from unrelated inline overrides.
- Distinguish disabled, loading, focus, and destructive states with more than color alone.
- Camera preview, overlays, and hit targets use one geometry model; layout scaling never replaces preview-to-photo mapping.

## Adaptation

- Mobile layouts support portrait, landscape, and safe areas.
- Desktop defines a minimum window size and reallocates timeline/inspector space predictably.
- Browser controls support touch and keyboard as well as a desktop pointer.
- Long strips and panels use scrolling or virtualization without shrinking controls below a readable size.
