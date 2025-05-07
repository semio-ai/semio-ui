import { useState, ChangeEvent, KeyboardEvent, useEffect } from "react";

const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState<string>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

export const useItemsInput = (
  initialItems: string[],
  onChange: (items: string[], field: string) => void,
  fieldName: string,
) => {
  const [items, setItems] = useState<string[]>(initialItems);
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue) {
      event.preventDefault();
      if (!items.includes(inputValue)) {
        const newItems = [...items, inputValue];
        setItems(newItems);
        onChange(newItems, fieldName);
        setInputValue("");
      }
    }
  };

  const handleRemoveItem = (item: string) => {
    const newItems = items.filter((t) => t !== item);
    setItems(newItems);
    onChange(newItems, fieldName);
  };

  return {
    items,
    inputValue,
    setInputValue,
    handleKeyDown,
    handleRemoveItem,
  };
};

export const useEmailsInput = (
  initialEmails: string[],
  onChange: (emails: string[], field: string) => void,
  fieldName: string,
) => {
  const [emails, setEmails] = useState<string[]>(initialEmails);
  const [inputValue, setInputValue] = useState<string>("");

  const [error, setError] = useState<string>("");
  const debouncedInputValue = useDebounce(inputValue, 500); // 500ms debounce

  useEffect(() => {
    setEmails(initialEmails);
  }, [initialEmails]);

  // Use effect to validate the debounced input value
  useEffect(() => {
    if (debouncedInputValue && !validateEmail(debouncedInputValue)) {
      setError("Please enter a valid email address.");
    } else {
      setError("");
    }
  }, [debouncedInputValue]);

  // Handle the keydown event to add a new email
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue) {
      event.preventDefault();
      if (!emails.includes(inputValue) && validateEmail(inputValue)) {
        const newEmails = [...emails, inputValue];
        setEmails(newEmails);
        onChange(newEmails, fieldName);
        setInputValue("");
        setError("");
      } else {
        setError("Please enter a valid email address.");
      }
    }
  };

  const handleRemoveEmail = (email: string) => {
    const newEmails = emails.filter((e) => e !== email);
    setEmails(newEmails);
    onChange(newEmails, fieldName);
  };

  return {
    emails,
    inputValue,
    setInputValue,
    handleKeyDown,
    handleRemoveEmail,
    error,
  };
};

export const useBooleanInput = (
  initialValue: boolean,
  onChange: (value: boolean, field: string) => void,
  fieldName: string,
) => {
  const [inputValue, setInputValue] = useState<boolean>(initialValue);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: boolean) => {
    // const newValue = e.target.checked;
    setInputValue(e);
    onChange(e, fieldName);
  };

  return {
    inputValue,
    handleChange,
  };
};

export const useInput = (
  initialValue: string,
  onChange: (value: string, field: string) => void,
  fieldName: string,
) => {
  const [inputValue, setInputValue] = useState<string>(initialValue);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    onChange(inputValue, fieldName);
  };

  return {
    inputValue,
    handleChange,
    handleBlur,
  };
};

export const useEmailInput = (
  initialEmail: string,
  onChange: (email: string, field: string) => void,
  fieldName: string,
) => {
  const [email, setEmail] = useState<string>(initialEmail);
  const [error, setError] = useState<string>("");
  const debouncedEmail = useDebounce(email, 500); // 500ms debounce

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (debouncedEmail) {
      if (!validateEmail(debouncedEmail)) {
        setError("Please enter a valid email address.");
      } else {
        setError("");
      }
    }
  }, [debouncedEmail]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    onChange(event.target.value, fieldName);
  };

  return {
    email,
    error,
    handleChange,
  };
};

export const useImageInput = (onChange: (file: File | null) => void, projectImageUrl?: string) => {
  const [localImageURL, setLocalImageURL] = useState<string | null>(projectImageUrl ?? null);

  useEffect(() => {
    // console.log("(useImageInput)Project Image URL changed:", projectImageUrl);
    setLocalImageURL(projectImageUrl ?? null);
  }, [projectImageUrl]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log("(useImageInput) handleChange called:", event.target.files);
    const file = event.target.files?.[0] || null;
    if (file) {
      console.log("(useImageInput) handleChange called:", file);
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalImageURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setLocalImageURL(null);
    onChange(null);
  };

  return {
    localImageURL,
    handleChange,
    handleRemove,
  };
};
