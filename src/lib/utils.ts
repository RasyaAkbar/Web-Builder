import { EditorElement } from "@/providers/editor/editor-provider";
import { type ClassValue, clsx } from "clsx"
import React from "react";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isDescendant= (draggedContainerId: string, container: EditorElement): boolean => {
  if (Array.isArray(container.content) && container.content.length > 0) {
      for (const child of container.content) {
          if (child.id === draggedContainerId || isDescendant(draggedContainerId, child)) {
              return true;
          }
      }
  }
  return false;
}

export const convertObjectToStringReact = (obj: any) => {
  let result = '{ ';
  
  for (const [key, value] of Object.entries(obj)) {
    // Handle strings by wrapping them in quotes
    const formattedValue = typeof value === 'string' ? `"${value}"` : value;
    
    // Append the key and value pair to the result string
    result += `${key}: ${formattedValue}, `;
  }
  
  // Remove the trailing comma and space
  result = result.slice(0, -2);
  
  result += ' }';
  return result;
};

export const convertObjectToStringHtml = (styles: any) => {
  return Object.entries(styles)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const kebabCaseKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      return `${kebabCaseKey}:${value}`;
    })
    .join(';');
};

export const convertObjectToStringCss = (styles: any) => {
  let result = '{ ';
  
  for (const [key, value] of Object.entries(styles)) {
    // Handle strings by wrapping them in quotes
    const formattedValue = typeof value === 'string' ? `${value}` : value;
    
    // Append the key and value pair to the result string
    result += `${key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}: ${formattedValue}; `;
  }
  
  // Remove the trailing comma and space
  result = result.slice(0, -2);
  
  result += ' }';
  return result;
};

export const paddingChecker = (style: React.CSSProperties )=>{
  return {
    ...style, // Spread the original styles last to ensure any pre-existing values override the defaults
    paddingBottom: style.paddingBottom || "2px",
    paddingTop: style.paddingTop || "2px",
    paddingLeft: style.paddingLeft || "2px",
    paddingRight: style.paddingRight || "2px",
    
  };
}
export const paddingCheckerContainer = (style: React.CSSProperties )=>{
  return {
    ...style, // Spread the original styles last to ensure any pre-existing values override the defaults
    paddingBottom: style.paddingBottom || "16px",
    paddingTop: style.paddingTop || "16px",
    paddingLeft: style.paddingLeft || "16px",
    paddingRight: style.paddingRight || "16px",
    
  };
}

export const marginChecker = (style: React.CSSProperties )=>{
  return {
    ...style, // Spread the original styles last to ensure any pre-existing values override the defaults
    marginBottom: style.marginBottom || "5px",
    marginTop: style.marginTop || "5px",
    marginLeft: style.marginLeft || "5px",
    marginRight: style.marginRight || "5px",
  };
}

export let htmlFormat=""


export const htmlFormatCompiler = (element: EditorElement)=>{
  let elementStyle = {...element.styles} // make deep copy
  if(Array.isArray(element.content)){
    elementStyle={...paddingCheckerContainer(elementStyle)}
    elementStyle= {...elementStyle, position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms", backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): ""};
    if(element.type === '__body'){
      elementStyle = {...elementStyle, padding: "0px", height: "100vh", overflow: "scroll",maxWidth: "100%", width: "100%"}
    }else{
      if(element.type=== 'container'){
        elementStyle= {...elementStyle, height: elementStyle.height || "fit-content", width: elementStyle.width || "100%"}
      }else{
        elementStyle= {...elementStyle, display: elementStyle.display || "flex", flexDirection: elementStyle.flexDirection || "column",height: elementStyle.height || "fit-content", width: elementStyle.width || "100%"}
      }
    }
    htmlFormat+= `<div style=${convertObjectToStringHtml(elementStyle)}>\n`
    element.content.map(item => htmlFormatCompiler(item))
    htmlFormat+= `</div>\n`

  }else{
    if(element.type === 'text'){
      elementStyle = {...paddingChecker(elementStyle)}
      elementStyle = {...marginChecker(elementStyle)}
      elementStyle = {...elementStyle, width: elementStyle.width || "100%", fontSize: elementStyle.fontSize || "16px", position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms",backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): "", fontFamily: elementStyle.fontFamily || "Sans-serif"}
      htmlFormat+=`<div style=${convertObjectToStringHtml(elementStyle)}>\n`
      htmlFormat+=`<span>\n${element.content.innerText}\n</span>\n`
      htmlFormat+= `</div>\n`
    }else if(element.type === 'video'){
      elementStyle = {...paddingChecker(elementStyle)}
      elementStyle = {...marginChecker(elementStyle)}
      elementStyle = {...elementStyle, width: elementStyle.width || "100%", fontSize: elementStyle.fontSize || "16px", position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms",backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): "", display: elementStyle.display || "flex", alignItems: elementStyle.alignItems|| "center", justifyContent: elementStyle.justifyContent || "center"}
      htmlFormat+=`<div style=${convertObjectToStringHtml(elementStyle)}>\n`
      htmlFormat+=`<iframe src=${element.content.src || '#'} style=${convertObjectToStringHtml(elementStyle)} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share"/>\n`
      htmlFormat+= `</div>\n`
    }else if(element.type === 'image'){
      elementStyle = {...paddingChecker(elementStyle)}
      elementStyle = {...marginChecker(elementStyle)}
      elementStyle = {...elementStyle, width: elementStyle.width || "100%", fontSize: elementStyle.fontSize || "16px", position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms",backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): "", display: elementStyle.display || "flex", alignItems: elementStyle.alignItems|| "center", justifyContent: elementStyle.justifyContent || "center"}
      htmlFormat+=`<div style=${convertObjectToStringHtml(elementStyle)}>\n`
      htmlFormat+=`<img src=${element.content.src || '#'} style=${convertObjectToStringHtml(elementStyle)}/>\n`
      htmlFormat+= `</div>\n`
    }else if(element.type === 'link'){
      elementStyle = {...paddingChecker(elementStyle)}
      elementStyle = {...marginChecker(elementStyle)}
      elementStyle = {...elementStyle, width: elementStyle.width || "100%", fontSize: elementStyle.fontSize || "16px", position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms",backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): "", textDecorationLine: elementStyle.textDecorationLine || "none", color: elementStyle.color || "blue", fontFamily: elementStyle.fontFamily || "Sans-serif"}
      htmlFormat+=`<div style=${convertObjectToStringHtml(elementStyle)}>\n`
      htmlFormat+=`<a href=${element.content.href || '#'} style=${convertObjectToStringHtml(elementStyle)}>\n${element.content.innerText}\n</a>\n`
      htmlFormat+= `</div>\n`
    }
  }
}

export const resetHtmlFormat=()=>{
  htmlFormat=""
}

export let reactFormat=""

export const reactFormatCompiler = (element: EditorElement)=>{
  let elementStyle = {...element.styles} // make deep copy
  if(Array.isArray(element.content)){
    elementStyle={...paddingCheckerContainer(elementStyle)}
    elementStyle= {...elementStyle, position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms", backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): ""};
    if(element.type === '__body'){
      elementStyle = {...elementStyle, padding: "0px", height: "100vh", overflow: "scroll",maxWidth: "100%", width: "100%"}
    }else{
      if(element.type=== 'container'){
        elementStyle= {...elementStyle, height: elementStyle.height || "fit-content", width: elementStyle.width || "100%"}
      }else{
        elementStyle= {...elementStyle, display: elementStyle.display || "flex", flexDirection: elementStyle.flexDirection || "column",height: elementStyle.height || "fit-content", width: elementStyle.width || "100%"}
      }
    }
    reactFormat+= `<div style={${convertObjectToStringReact(elementStyle)}}>\n`
    element.content.map(item => reactFormatCompiler(item))
    reactFormat+= `</div>\n`

  }else{
    if(element.type === 'text'){
      elementStyle = {...paddingChecker(elementStyle)}
      elementStyle = {...marginChecker(elementStyle)}
      elementStyle = {...elementStyle, width: elementStyle.width || "100%", fontSize: elementStyle.fontSize || "16px", position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms",backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): "", fontFamily: elementStyle.fontFamily || "Sans-serif"}
      reactFormat+=`<div style={${convertObjectToStringReact(elementStyle)}}>\n`
      reactFormat+=`<span>\n${element.content.innerText}\n</span>\n`
      reactFormat+= `</div>\n`
    }else if(element.type === 'video'){
      elementStyle = {...paddingChecker(elementStyle)}
      elementStyle = {...marginChecker(elementStyle)}
      elementStyle = {...elementStyle, width: elementStyle.width || "100%", fontSize: elementStyle.fontSize || "16px", position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms",backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): "", display: elementStyle.display || "flex", alignItems: elementStyle.alignItems|| "center", justifyContent: elementStyle.justifyContent || "center"}
      reactFormat+=`<div style={${convertObjectToStringReact(elementStyle)}}>\n`
      reactFormat+=`<iframe src="${element.content.src || '#'}" style={${convertObjectToStringReact(elementStyle)}} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share"/>\n`
      reactFormat+= `</div>\n`
    }else if(element.type === 'image'){
      elementStyle = {...paddingChecker(elementStyle)}
      elementStyle = {...marginChecker(elementStyle)}
      elementStyle = {...elementStyle, width: elementStyle.width || "100%", fontSize: elementStyle.fontSize || "16px", position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms",backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): "", display: elementStyle.display || "flex", alignItems: elementStyle.alignItems|| "center", justifyContent: elementStyle.justifyContent || "center"}
      reactFormat+=`<div style={${convertObjectToStringReact(elementStyle)}}>\n`
      reactFormat+=`<img src="${element.content.src || '#'} "style={${convertObjectToStringReact(elementStyle)}}/>\n`
      reactFormat+= `</div>\n`
    }else if(element.type === 'link'){
      elementStyle = {...paddingChecker(elementStyle)}
      elementStyle = {...marginChecker(elementStyle)}
      elementStyle = {...elementStyle, width: elementStyle.width || "100%", fontSize: elementStyle.fontSize || "16px", position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms",backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): "", textDecorationLine: elementStyle.textDecorationLine || "none", color: elementStyle.color || "blue", fontFamily: elementStyle.fontFamily || "Sans-serif"}
      reactFormat+=`<div style={${convertObjectToStringReact(elementStyle)}}>\n`
      reactFormat+=`<a href="${element.content.href || '#'}" style={${convertObjectToStringReact(elementStyle)}}>\n${element.content.innerText}\n</a>\n`
      reactFormat+= `</div>\n`
    }
  }
}

export const resetReactFormat=()=>{
  reactFormat=""
}



export let cssFormat=""

export const cssFormatCompiler = (element: EditorElement)=>{
  let elementStyle = {...element.styles} // make deep copy
  if(Array.isArray(element.content)){
    elementStyle={...paddingCheckerContainer(elementStyle)}
    elementStyle= {...elementStyle, position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms", backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): ""};
    if(element.type === '__body'){
      elementStyle = {...elementStyle, padding: "0px", height: "100vh", overflow: "scroll",maxWidth: "100%", width: "100%"}
    }else{
      if(element.type=== 'container'){
        elementStyle= {...elementStyle, height: elementStyle.height || "fit-content", width: elementStyle.width || "100%"}
      }else{
        elementStyle= {...elementStyle, display: elementStyle.display || "flex", flexDirection: elementStyle.flexDirection || "column",height: elementStyle.height || "fit-content", width: elementStyle.width || "100%"}
      }
    }
    cssFormat+= `<div style={${convertObjectToStringCss(elementStyle)}}>\n`
    element.content.map(item => cssFormatCompiler(item))
    cssFormat+= `</div>\n`

  }else{
    if(element.type === 'text'){
      elementStyle = {...paddingChecker(elementStyle)}
      elementStyle = {...marginChecker(elementStyle)}
      elementStyle = {...elementStyle, width: elementStyle.width || "100%", fontSize: elementStyle.fontSize || "16px", position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms",backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): "", fontFamily: elementStyle.fontFamily || "Sans-serif"}
      cssFormat+=`<div style={${convertObjectToStringCss(elementStyle)}}>\n`
      cssFormat+=`<span>\n${element.content.innerText}\n</span>\n`
      cssFormat+= `</div>\n`
    }else if(element.type === 'video'){
      elementStyle = {...paddingChecker(elementStyle)}
      elementStyle = {...marginChecker(elementStyle)}
      elementStyle = {...elementStyle, width: elementStyle.width || "100%", fontSize: elementStyle.fontSize || "16px", position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms",backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): "", display: elementStyle.display || "flex", alignItems: elementStyle.alignItems|| "center", justifyContent: elementStyle.justifyContent || "center"}
      cssFormat+=`<div style={${convertObjectToStringCss(elementStyle)}}>\n`
      cssFormat+=`<iframe src=${element.content.src || '#'} style={${convertObjectToStringCss(elementStyle)}} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share"/>\n`
      cssFormat+= `</div>\n`
    }else if(element.type === 'image'){
      elementStyle = {...paddingChecker(elementStyle)}
      elementStyle = {...marginChecker(elementStyle)}
      elementStyle = {...elementStyle, width: elementStyle.width || "100%", fontSize: elementStyle.fontSize || "16px", position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms",backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): "", display: elementStyle.display || "flex", alignItems: elementStyle.alignItems|| "center", justifyContent: elementStyle.justifyContent || "center"}
      cssFormat+=`<div style={${convertObjectToStringCss(elementStyle)}}>\n`
      cssFormat+=`<img src=${element.content.src || '#'} style={${convertObjectToStringCss(elementStyle)}}/>\n`
      cssFormat+= `</div>\n`
    }else if(element.type === 'link'){
      elementStyle = {...paddingChecker(elementStyle)}
      elementStyle = {...marginChecker(elementStyle)}
      elementStyle = {...elementStyle, width: elementStyle.width || "100%", fontSize: elementStyle.fontSize || "16px", position: "relative", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",transitionDuration: "150ms",backgroundImage: elementStyle.backgroundImage? elementStyle.backgroundImage.replaceAll(" ", ""): "", textDecorationLine: elementStyle.textDecorationLine || "none", color: elementStyle.color || "blue", fontFamily: elementStyle.fontFamily || "Sans-serif"}
      cssFormat+=`<div style={${convertObjectToStringCss(elementStyle)}}>\n`
      cssFormat+=`<a href=${element.content.href || '#'} style={${convertObjectToStringCss(elementStyle)}}>\n${element.content.innerText}\n</a>\n`
      cssFormat+= `</div>\n`
    }
  }
}

export const resetCssFormat=()=>{
  cssFormat=""
}