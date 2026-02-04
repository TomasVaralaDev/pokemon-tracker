export const cleanName = (name: string) => {
    return name.replace('extended-', '').replace('original-', '').replace('-', ' ');
  };
  
  export const capitalize = (name: string) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  };