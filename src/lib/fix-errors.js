// fix-errors.js
// Liste des erreurs communes à corriger dans les composants import { fixCharacters } from './fix-accent-encoding.mjs';

import { useEffect, useRef, React } from 'react';
// Exportation de la fonction pour l'utiliser dans les composants
export function fixScrollToBottom(component) {
  // S'assurer que la fonction scrollToBottom est définie
  if (!component.scrollToBottom && component.messagesEndRef) {
    component.scrollToBottom = () => {
      if (component.messagesEndRef.current) {
        component.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
  }
  
  // S'assurer qu'il y a un effet pour appeler scrollToBottom quand les messages changent
  if (component.scrollToBottom && component.messages) {
    // Vérifier si l'effet existe déjà
    let hasScrollEffect = false;
    
    // Parcourir les effets existants
    if (component._effects) {
      for (const effect of component._effects) {
        if (effect.deps && effect.deps.includes(component.messages)) {
          hasScrollEffect = true;
          break;
        }
      }
    }
    
    // Ajouter l'effet s'il n'existe pas
    if (!hasScrollEffect) {
      React.useEffect(() => {
        component.scrollToBottom();
      }, [component.messages]);
    }
  }
  
  return component;
}

// Corriger les problèmes d'encodage des caractères dans les composants
export function fixComponentEncoding(component) {
  if (!component) return component;
  
  // Corriger les propriétés textuelles du composant
  if (component.props) {
    for (const key in component.props) {
      if (typeof component.props[key] === 'string') {
        component.props[key] = fixCharacters(component.props[key]);
      }
    }
  }
  
  // Corriger les éléments enfants textuels
  if (component.children) {
    if (typeof component.children === 'string') {
      component.children = fixCharacters(component.children);
    } else if (Array.isArray(component.children)) {
      component.children = component.children.map(child => {
        if (typeof child === 'string') {
          return fixCharacters(child);
        }
        return fixComponentEncoding(child);
      });
    }
  }
  
  return component;
}

// Corriger les problèmes de référence manquantes
export function fixMissingRefs(component) {
  // S'assurer que les refs nécessaires sont définies
  if (component.useRef && !component.messagesEndRef) {
    component.messagesEndRef = component.useRef(null);
  }
  
  // Vérifier que les refs sont utilisées dans le rendu
  if (component.render && component.messagesEndRef) {
    const originalRender = component.render;
    component.render = function() {
      const result = originalRender.apply(this, arguments);
      
      // S'assurer qu'il y a un élément avec la ref
      let hasRef = false;
      
      // Fonction pour analyser les éléments et vérifier les refs
      const checkRefs = (element) => {
        if (!element) return;
        
        if (element.ref === component.messagesEndRef) {
          hasRef = true;
        }
        
        if (element.props && element.props.children) {
          if (Array.isArray(element.props.children)) {
            element.props.children.forEach(checkRefs);
          } else {
            checkRefs(element.props.children);
          }
        }
      };
      
      checkRefs(result);
      
      // Ajouter un élément avec la ref si nécessaire
      if (!hasRef && result.props && result.props.children) {
        // Ajouter un div avec la ref à la fin des enfants
        if (Array.isArray(result.props.children)) {
          result.props.children.push(
            <div ref={component.messagesEndRef}></div>
          );
        } else {
          result.props.children = [
            result.props.children,
            <div ref={component.messagesEndRef}></div>
          ];
        }
      }
      
      return result;
    };
  }
  
  return component;
}

// Exportation du bundle de correction d'erreurs
export default function fixComponentErrors(component) {
  // Appliquer toutes les corrections
  component = fixScrollToBottom(component);
  component = fixComponentEncoding(component);
  component = fixMissingRefs(component);
  
  return component;
}
