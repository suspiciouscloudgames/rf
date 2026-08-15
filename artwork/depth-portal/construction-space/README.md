# Construction Space Depth Portal Assets

## Source roles

- `source/reference-01.png`: supporting reference for shadow and edge comparison
- `source/reference-02.png`: supporting reference for shadow and edge comparison
- `source/reference-03.png`: registered color and layer extraction target
- `working/clean-foreground.png`: foreground net/supports removed
- `working/far-background.png`: foreground and blue tarp removed
- `working/depth-master-16bit.png`: production depth master

The two working background plates were produced with the built-in image editing model and then resized to the exact `990 x 1750` reference registration. Runtime depth and masks are generated deterministically by `scripts/build_depth_portal_assets.py`.

## Image edit prompts

### Clean foreground plate

```text
Remove only the foreground orange construction safety mesh/net and its foreground
support posts and diagonal braces. Reconstruct the occluded dark floor, lower walls,
doorway area, and empty interior. Preserve the exact portrait framing, perspective,
blue tarp, exposure, colors, non-foreground objects, and dark mysterious mood.
Do not add people, furniture, text, logos, or architectural changes.
```

### Far background plate

```text
From the clean foreground plate, remove only the blue tarp/curtain and its attached
hanging objects. Reconstruct a quiet dim passage behind it. Preserve exact framing,
perspective, walls, doorway boundaries, ceiling, bright left opening, dark floor,
exposure, and colors. Do not reframe, brighten, or redesign the architecture.
```

## Runtime output

All runtime assets are written to:

```text
public/assets/depth-portal/construction-space/
```

The current output is `990 x 1750` and approximately 808KB in total. Production PNG masters are tracked through Git LFS; optimized runtime WebP/PNG assets remain regular Git files.
