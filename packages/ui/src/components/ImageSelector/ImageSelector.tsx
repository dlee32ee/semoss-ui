import { useState, useEffect, useMemo } from "react";
import { styled } from "@mui/material";
// import { usePixel, useRootStore, useDatabase } from "@/hooks";

import { Box } from "../../";
import { Checkbox } from "../../";
import { FileDropzone } from "../../";
import { ImageList } from "./ImageList";
import { ImageListItem } from "./ImageListItem";
import { ImageListItemBar } from "./ImageListItemBar";
import { Typography } from "../../";

const StyledBox = styled(Box)({
    width: "600px",
    height: "300px",
    margin: "8px",
});

const StyledImageList = styled(ImageList)({
    width: "600px",
    height: "300px",
    // Promote the list into its own layer in Chrome. This costs memory, but helps keeping high FPS.
    transform: "translateZ(0)",
    padding: "16px, 0px, 16px, 0px",
});

const StyledImageListItem = styled(ImageListItem)({
    width: "120px",
    height: "120px",
    // border: "solid 1px #0000003B",
    zIndex: 998,
    borderRadius: "8px",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    "&:hover": {
        border: "solid 2px #0471F0",
        // opacity: ".5",
    },
    // "&.isChecked": {
    //     border: "solid 2px #0471F0",
    //     opacity: ".5",
    // },
});

const StyledDragAndDrop = styled(ImageListItem)({
    width: "120px",
    height: "120px",
    borderRadius: "8px",
});

const StyledFileDropzone = styled(FileDropzone)({
    width: "100%",
    height: "100%",
    padding: "0",
    textAlign: "center",
});

const StyledImageListItemBar = styled(ImageListItemBar)({
    marginLeft: "8px",
    background: "rgba(0,0,0,0)",
    width: "20px",
    height: "20px",
    top: "8px",
    borderRadius: "2px",
});

const StyledCheckbox = styled(Checkbox)({
    "&:hover": {
        color: "#0471F0",
    },
    "&.isChecked": {
        opacity: "1",
    },
});

export interface ImageSelectorProps {
    /** src value of selected image */
    value: string;

    /** Callback for handling when an image is selected*/
    onChange?: (val) => void;

    // image options
    options: { title: string; src: string; fileContents?: unknown }[];
}

export const ImageSelector = (props: ImageSelectorProps): JSX.Element => {
    const { value, options, onChange, ...otherProps } = props;

    // set checked image to the default value
    const [checked, setCheckbox] = useState(value);
    const [controlledImages, setControlledImages] = useState<
        { title: string; src: string; fileContents?: unknown }[]
    >([]);

    useEffect(() => {
        const contImages = [];
        options.forEach((opt) => {
            contImages.push(opt);
        });

        setControlledImages(options);

        return () => {
            setControlledImages([]);
        };
    }, [options.length, options]);

    const checkImage = (image) => {
        setCheckbox(image.src);

        // Pass image to parent
        onChange(image);
    };

    /**
     * @name handleAddNewImage
     * @desc add new image, compare it to default list
     * @param value
     */
    const handleAddNewImage = (value) => {
        // 1. Add File to controlledImages, but first create interface to hold new image url;
        const imageurl = URL.createObjectURL(value);

        console.log("img url", imageurl);

        const newControlledImage = {
            title: value.name,
            src: imageurl,
            fileContents: value,
        };

        const newControlledImages = controlledImages;
        newControlledImages.push(newControlledImage);

        // Set new controlled images in state
        setControlledImages(newControlledImages);
        setCheckbox(newControlledImage.src);

        // Pass new file to parent
        onChange(newControlledImage);
    };

    return (
        <StyledBox {...otherProps}>
            <Typography variant="subtitle1">Select Image</Typography>
            <Typography variant="caption">
                Select a default image or upload your own
            </Typography>
            <StyledImageList
                rowHeight={117}
                gap={16}
                cols={4}
                variant="standard"
            >
                <StyledDragAndDrop key={0}>
                    <StyledFileDropzone
                        description="Browse"
                        onChange={(value) => handleAddNewImage(value)}
                    />
                </StyledDragAndDrop>
                {controlledImages.map((image, id) => {
                    return (
                        <StyledImageListItem
                            key={id}
                            value={image.src}
                            className={`${
                                checked === image.src ? "isChecked" : ""
                            }`}
                            sx={{ backgroundImage: `url(${image.src})` }}
                        >
                            <StyledImageListItemBar
                                position={"top"}
                                actionIcon={
                                    <StyledCheckbox
                                        checked={checked === image.src}
                                        onChange={() => checkImage(image)}
                                    />
                                }
                                actionPosition={"left"}
                            />
                        </StyledImageListItem>
                    );
                })}
            </StyledImageList>
        </StyledBox>
    );
};
