import React, { ReactNode } from "react";
import MuiTableContainer from "@mui/material/TableContainer";
import { SxProps } from "@mui/system";

export interface TableContainerProps {
    /** children to be rendered */
    children?: ReactNode;
    component?: React.ReactElement<any, any>;
    /** custom style object */
    sx?: SxProps;
}

export const TableContainer = (props: TableContainerProps) => {
    const { children, sx } = props;
    return (
        <MuiTableContainer sx={sx} {...props}>
            {children}
        </MuiTableContainer>
    );
};
