import TextField from "@mui/material/TextField";
import { debounce } from "lodash";
import { Dispatch, SetStateAction } from "react";

interface SearchCoinProps {
  setInputCoinNameSetter: Dispatch<SetStateAction<string>>;
}

export default function SearchCoin({
  setInputCoinNameSetter
}: SearchCoinProps) {
  const handleChange = debounce(event => {
    setInputCoinNameSetter(event.target.value.toUpperCase());
  }, 10);
  return (
    <TextField
      label=""
      onChange={handleChange}
      placeholder={"검색어를 입력하세요"}
      inputProps={{
        maxLength: 25
      }}
      sx={textFieldStyle}
    />
  );
}

const textFieldStyle = {
  backgroundColor: "white",
  height: "48px",
  pr: 2,
  width: "100%",
  gap: 2
};
