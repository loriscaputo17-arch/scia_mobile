import { Text, TouchableOpacity, TouchableOpacityProps, useWindowDimensions } from 'react-native';
import React from 'react';
import { breakpoints } from '@/constants/breakpoints';

type ButtonProps = {
  label?: string;
  theme: 'default' | 'defaultVertical' | 'mediumQuaternary' | 'mediumTertiary' | 'noBackground' | 'justifyBetween' | 'menu' | 'header' | 'modal' | 'checkbutton' /* | "form" */;
  IconComponent?: React.ComponentType<any>;
  iconProps?: {
    name: string;
    size?: number;
    color?: string;
  };
  onPress?: () => Promise<void> | void;
  styleWindContainer?: string;
  styleWindtext?: string;
  disabled?: boolean;
} & TouchableOpacityProps;

const Button = ({
  label,
  IconComponent,
  iconProps,
  theme,
  styleWindContainer,
  styleWindtext,
  onPress,
  disabled,
  ...touchableProps
}: ButtonProps) => {

  const { width } = useWindowDimensions();
  const isMobile = width < breakpoints.md;
  
  // Oggetto di configurazione degli stili basato sul tema
  const themeStyles = {
    menu: {
      containerClass: `flex-row mb-space xxl:mb-space-xxl items-center ${styleWindContainer}`, // z-30
      textClass: 'text-quaternary',
      iconClass: 'text-[#001c38] opacity-60 mr-space xxl:mr-space-xxl',
      iconSize: 24,
    },
    default: {
      containerClass: `py-2 px-4 flex-row justify-center items-center bg-secondary rounded-md self-start ${styleWindContainer}`,
      textClass: 'text-primary font-bold',
      iconClass: label ? 'mr-space xxl:mr-space-xxl' : '',
      iconSize: 24,
    },
    defaultVertical: {
      containerClass: `bg-primary items-center p-10 rounded-md flex-col justify-center items-center ${styleWindContainer}`,
      textClass: 'text-primary text-xl mt-space',
      iconClass: 'text-primary',
      iconSize: 44,
    },
    mediumQuaternary: {
      containerClass: `bg-quaternary py-4 px-8 flex-row justify-center items-center rounded-md self-start ${styleWindContainer}`,
      textClass: 'text-primary font-bold',
      iconClass: 'mr-space xxl:mr-space-xxl',
      iconSize: 24,
    },
    mediumTertiary: {
      containerClass: `bg-quaternary py-4 px-8 flex-row justify-center items-center bg-tertiary rounded-md self-start ${styleWindContainer}`,
      textClass: 'text-primary font-bold',
      iconClass: 'mr-space xxl:mr-space-xxl',
      iconSize: 24,
    },
    noBackground: {
      containerClass: `flex-row items-center ${styleWindContainer}`,
      textClass: `text-primary font-bold ${styleWindtext}`,
      iconClass: label && 'mr-space xxl:mr-space-xxl ',
      iconSize: 24,
    },
    justifyBetween: {
      containerClass: `w-full flex-row-reverse justify-between items-center ${styleWindContainer}`,
      textClass: `text-primary font-bold ${styleWindtext}`,
      iconClass: '',
      iconSize: 24,
    },
    modal: {
      containerClass: `p-4 flex-row justify-center items-center bg-tertiary w-full rounded-md ${styleWindContainer}`,
      textClass: `text-primary font-bold ${styleWindtext}`,
      iconClass: 'mr-space xxl:mr-space-xxl',
      iconSize: 24,
    },
    header: {
      containerClass: `flex-row justify-center items-center bg-secondary rounded-md flex-2 ${styleWindContainer}`,
      textClass: `${styleWindtext}`,
      iconClass: 'text-tertiary',
      iconSize: isMobile ? 30 : 40 ,
    },
    checkbutton: {
      containerClass: `flex-row items-center justify-center ${styleWindContainer}`, // Puoi personalizzare ulteriormente
      textClass: 'text-white font-bold', // Modifica il colore del testo secondo le tue preferenze
      iconClass: 'mr-space',
      iconSize: 28,
    },
    // form: {
    //   containerClass: `flex flex-row-reverse items-center justify-between bg-quaternary border border-quaternary rounded-md h-12 p-3 ${
    //     disabled ? "opacity-50" : "opacity-100"
    //   } ${styleWindContainer}`,
    //   textClass: "text-primary font-bold",
    //   iconClass: "",
    //   iconSize: 24,
    // },

  };

  const { containerClass, textClass, iconClass, iconSize } = themeStyles[theme];

  return (
    <TouchableOpacity onPress={onPress} className={containerClass} disabled={disabled} {...touchableProps}>
      {IconComponent && (
        <IconComponent
          size={iconSize} // Imposta l'iconSize specifico del tema
          className={`${iconClass} ${disabled ? 'opacity-20' : 'opacity-1'}`}
          {...iconProps}
        />
      )}
      {label && <Text className={`${textClass} ${disabled ? 'opacity-20' : 'opacity-1'}`} numberOfLines={1}>{label}</Text>}
    </TouchableOpacity>
  );
};

export default Button;
