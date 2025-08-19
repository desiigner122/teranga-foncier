// src/data/senegalData.js
// Données complètes pour les divisions administratives, banques et spécialités des notaires du Sénégal

// Divisions administratives hiérarchiques du Sénégal (Régions -> Départements -> Communes)
// Structure: regions: [ { code, name, departments: [ { code, name, communes: [ { code, name } ] } ] } ]
export const senegalAdministrativeDivisions = [
  {
    code: 'DK',
    name: 'Dakar',
    departments: [
      { code: 'DK-DK', name: 'Dakar', communes: [
        { code: 'DK-DK-PLATEAU', name: 'Plateau' },
        { code: 'DK-DK-MEDINA', name: 'Médina' },
        { code: 'DK-DK-FANN', name: 'Fann-Point E-Amitié' },
        { code: 'DK-DK-GUEULE', name: 'Gueule Tapée-Fass-Colobane' },
        { code: 'DK-DK-HANN', name: 'Hann Bel-Air' },
        { code: 'DK-DK-HLM', name: 'HLM' },
        { code: 'DK-DK-DIEUPPEUL', name: 'Dieuppeul-Derklé' },
        { code: 'DK-DK-GOREE', name: 'Gorée' },
        { code: 'DK-DK-GRAND', name: 'Grand Dakar' },
        { code: 'DK-DK-BISCUITERIE', name: 'Biscuiterie' },
        { code: 'DK-DK-SICAP', name: 'Sicap-Liberté' },
        { code: 'DK-DK-MERMOZ', name: 'Mermoz-Sacré Cœur' },
        { code: 'DK-DK-OUAKAM', name: 'Ouakam' },
        { code: 'DK-DK-NGOR', name: 'Ngor' },
        { code: 'DK-DK-YOFF', name: 'Yoff' },
        { code: 'DK-DK-GRAND-YOFF', name: 'Grand Yoff' },
        { code: 'DK-DK-PATTE', name: 'Patte d\'Oie' },
        { code: 'DK-DK-PARCELLES', name: 'Parcelles Assainies' },
        { code: 'DK-DK-CAMBERENE', name: 'Cambérène' }
      ]},
      { code: 'DK-GUE', name: 'Guédiawaye', communes: [
        { code: 'DK-GUE-GOLF', name: 'Golf Sud' },
        { code: 'DK-GUE-SAM', name: 'Sam Notaire' },
        { code: 'DK-GUE-NDIAREME', name: 'Ndiarème Limamoulaye' },
        { code: 'DK-GUE-WAKHINANE', name: 'Wakhinane Nimzatt' },
        { code: 'DK-GUE-MEDINA', name: 'Médina Gounass' }
      ]},
      { code: 'DK-PIK', name: 'Pikine', communes: [
        { code: 'DK-PIK-OUEST', name: 'Pikine Ouest' },
        { code: 'DK-PIK-NORD', name: 'Pikine Nord' },
        { code: 'DK-PIK-EST', name: 'Pikine Est' },
        { code: 'DK-PIK-GUINAW', name: 'Guinaw Rails Nord' },
        { code: 'DK-PIK-GUINAW-SUD', name: 'Guinaw Rails Sud' },
        { code: 'DK-PIK-DIAMAGUENE', name: 'Diamaguène Sicap Mbao' },
        { code: 'DK-PIK-THIAROYE', name: 'Thiaroye Gare' },
        { code: 'DK-PIK-THIAROYE-MER', name: 'Thiaroye sur Mer' },
        { code: 'DK-PIK-TIVAOUANE', name: 'Tivaouane Diacksao' },
        { code: 'DK-PIK-MBAO', name: 'Mbao' },
        { code: 'DK-PIK-KEUR-MASSAR', name: 'Keur Massar Nord' },
        { code: 'DK-PIK-KEUR-MASSAR-SUD', name: 'Keur Massar Sud' },
        { code: 'DK-PIK-MALIKA', name: 'Malika' },
        { code: 'DK-PIK-YEUMBEUL', name: 'Yeumbeul Sud' },
        { code: 'DK-PIK-YEUMBEUL-NORD', name: 'Yeumbeul Nord' }
      ]},
      { code: 'DK-RUF', name: 'Rufisque', communes: [
        { code: 'DK-RUF-EST', name: 'Rufisque Est' },
        { code: 'DK-RUF-OUEST', name: 'Rufisque Ouest' },
        { code: 'DK-RUF-NORD', name: 'Rufisque Nord' },
        { code: 'DK-RUF-BARGNY', name: 'Bargny' },
        { code: 'DK-RUF-SEBIKOTANE', name: 'Sébikotane' },
        { code: 'DK-RUF-DIAMNIADIO', name: 'Diamniadio' },
        { code: 'DK-RUF-SANGALKAM', name: 'Sangalkam' },
        { code: 'DK-RUF-JAXAAY', name: 'Jaxaay-Parcelles' },
        { code: 'DK-RUF-BAMBYLOR', name: 'Bambylor' },
        { code: 'DK-RUF-TIVAOUANE-PEUL', name: 'Tivaouane Peul-Niaga' },
        { code: 'DK-RUF-YENE', name: 'Yène' }
      ]}
    ]
  },
  {
    code: 'TH',
    name: 'Thiès',
    departments: [
      { code: 'TH-TH', name: 'Thiès', communes: [
        { code: 'TH-TH-OUEST', name: 'Thiès Ouest' },
        { code: 'TH-TH-EST', name: 'Thiès Est' },
        { code: 'TH-TH-NORD', name: 'Thiès Nord' },
        { code: 'TH-TH-FANDENE', name: 'Fandène' },
        { code: 'TH-TH-KEUR-MOUSSA', name: 'Keur Moussa' },
        { code: 'TH-TH-DIENDER', name: 'Diender Guedj' },
        { code: 'TH-TH-KAYAR', name: 'Kayar' },
        { code: 'TH-TH-KHOMBOLE', name: 'Khombole' },
        { code: 'TH-TH-POUT', name: 'Pout' },
        { code: 'TH-TH-NOTTO', name: 'Notto Diobass' },
        { code: 'TH-TH-NIACOURAB', name: 'Niacourab' },
        { code: 'TH-TH-KEURCHEIKH', name: 'Keur Cheikh' }
      ]},
      { code: 'TH-MBO', name: 'Mbour', communes: [
        { code: 'TH-MBO-MBOUR', name: 'Mbour' },
        { code: 'TH-MBO-JOAL', name: 'Joal-Fadiouth' },
        { code: 'TH-MBO-NGUEKOKH', name: 'Nguékhokh' },
        { code: 'TH-MBO-THIADIAYE', name: 'Thiadiaye' },
        { code: 'TH-MBO-SALY', name: 'Saly Portudal' },
        { code: 'TH-MBO-POPENGUINE', name: 'Popenguine-Ndayane' },
        { code: 'TH-MBO-NGAPAROU', name: 'Ngaparou' },
        { code: 'TH-MBO-SOMONE', name: 'Somone' },
        { code: 'TH-MBO-FISSEL', name: 'Fissel' },
        { code: 'TH-MBO-SESSENE', name: 'Séssène' },
        { code: 'TH-MBO-SINDIA', name: 'Sindia' },
        { code: 'TH-MBO-MALICOUNDA', name: 'Malicounda' }
      ]},
      { code: 'TH-TIV', name: 'Tivaouane', communes: [
        { code: 'TH-TIV-TIVAOUANE', name: 'Tivaouane' },
        { code: 'TH-TIV-MBORO', name: 'Mboro' },
        { code: 'TH-TIV-MEKHE', name: 'Mékhé' },
        { code: 'TH-TIV-PIRE', name: 'Pire Goureye' },
        { code: 'TH-TIV-MEOUANE', name: 'Méouane' },
        { code: 'TH-TIV-DAROU', name: 'Darou Khoudoss' },
        { code: 'TH-TIV-TAIBA', name: 'Taïba Ndiaye' },
        { code: 'TH-TIV-NGAYE', name: 'Ngaye Mékhé' },
        { code: 'TH-TIV-PAMBAL', name: 'Pambal' },
        { code: 'TH-TIV-MERINA', name: 'Merina' }
      ]}
    ]
  },
  {
    code: 'DL',
    name: 'Diourbel',
    departments: [
      { code: 'DL-DL', name: 'Diourbel', communes: [
        { code: 'DL-DL-DIOURBEL', name: 'Diourbel' },
        { code: 'DL-DL-NDOULO', name: 'Ndoulo' },
        { code: 'DL-DL-PATTAR', name: 'Pattar' },
        { code: 'DL-DL-TOCKY', name: 'Tocky Gare' },
        { code: 'DL-DL-TOUBA', name: 'Touba Mosquée' }
      ]},
      { code: 'DL-BAM', name: 'Bambey', communes: [
        { code: 'DL-BAM-BAMBEY', name: 'Bambey' },
        { code: 'DL-BAM-DINGUIRAYE', name: 'Dinguiraye' },
        { code: 'DL-BAM-GAWANE', name: 'Gawane' },
        { code: 'DL-BAM-LAMBAYE', name: 'Lambaye' },
        { code: 'DL-BAM-NGOYE', name: 'Ngoye' }
      ]},
      { code: 'DL-MB', name: 'Mbacké', communes: [
        { code: 'DL-MB-MBACKE', name: 'Mbacké' },
        { code: 'DL-MB-TOUBA', name: 'Touba Mosquée' },
        { code: 'DL-MB-TAIF', name: 'Taïf' },
        { code: 'DL-MB-SADIO', name: 'Sadio' }
      ]}
    ]
  },
  {
    code: 'SL',
    name: 'Saint-Louis',
    departments: [
      { code: 'SL-SL', name: 'Saint-Louis', communes: [
        { code: 'SL-SL-SLN', name: 'Saint-Louis Nord' },
        { code: 'SL-SL-SLS', name: 'Saint-Louis Sud' },
        { code: 'SL-SL-SLB', name: 'Saint-Louis (Barre)' },
        { code: 'SL-SL-SLR', name: 'Saint-Louis (Sor)' },
        { code: 'SL-SL-MPAL', name: 'Mpal' },
        { code: 'SL-SL-FASS', name: 'Fass Ngom' },
        { code: 'SL-SL-GANDON', name: 'Gandon' },
        { code: 'SL-SL-NDIEBENE', name: 'Ndiébène Gandiole' }
      ]},
      { code: 'SL-DAG', name: 'Dagana', communes: [
        { code: 'SL-DAG-DAGANA', name: 'Dagana' },
        { code: 'SL-DAG-RICHARD', name: 'Richard-Toll' },
        { code: 'SL-DAG-ROSS', name: 'Ross-Béthio' },
        { code: 'SL-DAG-ROSSO', name: 'Rosso Sénégal' },
        { code: 'SL-DAG-GAE', name: 'Gaé' },
        { code: 'SL-DAG-NDOMBO', name: 'Ndombo Sandjiry' }
      ]},
      { code: 'SL-POD', name: 'Podor', communes: [
        { code: 'SL-POD-PODOR', name: 'Podor' },
        { code: 'SL-POD-NDIOUM', name: 'Ndioum' },
        { code: 'SL-POD-NIANDANE', name: 'Niandane' },
        { code: 'SL-POD-GOLERE', name: 'Golléré' },
        { code: 'SL-POD-MBOUMBA', name: 'Mboumba' },
        { code: 'SL-POD-WALALDE', name: 'Walaldé' },
        { code: 'SL-POD-AERE', name: 'Aéré Lao' },
        { code: 'SL-POD-BODE', name: 'Bodé Lao' },
        { code: 'SL-POD-DEMETTE', name: 'Démette' },
        { code: 'SL-POD-PETE', name: 'Pété' }
      ]}
    ]
  },
  {
    code: 'ZG',
    name: 'Ziguinchor',
    departments: [
      { code: 'ZG-ZIG', name: 'Ziguinchor', communes: [
        { code: 'ZG-ZIG-ZIG', name: 'Ziguinchor' },
        { code: 'ZG-ZIG-NIAGUIS', name: 'Niaguis' },
        { code: 'ZG-ZIG-ADEAN', name: 'Adéane' },
        { code: 'ZG-ZIG-BOUTOUPA', name: 'Boutoupa Camaracounda' },
        { code: 'ZG-ZIG-ENAMPOR', name: 'Enampore' }
      ]},
      { code: 'ZG-BIG', name: 'Bignona', communes: [
        { code: 'ZG-BIG-BIGNONA', name: 'Bignona' },
        { code: 'ZG-BIG-THIONCK', name: 'Thionck Essyl' },
        { code: 'ZG-BIG-DIOULOULOU', name: 'Diouloulou' },
        { code: 'ZG-BIG-TENGHORY', name: 'Tenghory' },
        { code: 'ZG-BIG-SINDIAN', name: 'Sindian' }
      ]},
      { code: 'ZG-OUS', name: 'Oussouye', communes: [
        { code: 'ZG-OUS-OUSSOUYE', name: 'Oussouye' },
        { code: 'ZG-OUS-DIEMBERING', name: 'Diembéring' },
        { code: 'ZG-OUS-SANTHIABA', name: 'Santhiaba Manjacque' },
        { code: 'ZG-OUS-MLOMP', name: 'Mlomp' },
        { code: 'ZG-OUS-CAP', name: 'Cap Skirring' }
      ]}
    ]
  },
  {
    code: 'FK',
    name: 'Fatick',
    departments: [
      { code: 'FK-FK', name: 'Fatick', communes: [
        { code: 'FK-FK-FATICK', name: 'Fatick' },
        { code: 'FK-FK-DIOFFIOR', name: 'Dioffior' },
        { code: 'FK-FK-DIAKHAO', name: 'Diakhao' },
        { code: 'FK-FK-MBELLACADIAO', name: 'Mbellacadiao' }
      ]},
      { code: 'FK-FDK', name: 'Foundiougne', communes: [
        { code: 'FK-FDK-FOUNDIOUGNE', name: 'Foundiougne' },
        { code: 'FK-FDK-SOKONE', name: 'Sokone' },
        { code: 'FK-FDK-KARANG', name: 'Karang Poste' },
        { code: 'FK-FDK-PASSY', name: 'Passy' },
        { code: 'FK-FDK-SOUM', name: 'Soum' },
        { code: 'FK-FDK-DJILOR', name: 'Djilor' }
      ]},
      { code: 'FK-GOS', name: 'Gossas', communes: [
        { code: 'FK-GOS-GOSSAS', name: 'Gossas' },
        { code: 'FK-GOS-COLOBANE', name: 'Colobane' },
        { code: 'FK-GOS-MBAR', name: 'Mbar' }
      ]}
    ]
  },
  {
    code: 'KF',
    name: 'Kaffrine',
    departments: [
      { code: 'KF-KF', name: 'Kaffrine', communes: [
        { code: 'KF-KF-KAFFRINE', name: 'Kaffrine' },
        { code: 'KF-KF-GNIBY', name: 'Gniby' },
        { code: 'KF-KF-KATAKEL', name: 'Kathiote' }
      ]},
      { code: 'KF-BK', name: 'Birkelane', communes: [
        { code: 'KF-BK-BIRKELANE', name: 'Birkelane' },
        { code: 'KF-BK-KEUR', name: 'Keur Mboucki' },
        { code: 'KF-BK-TOUBA', name: 'Touba Mbella' }
      ]},
      { code: 'KF-KG', name: 'Koungheul', communes: [
        { code: 'KF-KG-KOUNGHEUL', name: 'Koungheul' },
        { code: 'KF-KG-MISSIRAH', name: 'Missirah Wadène' },
        { code: 'KF-KG-SALI', name: 'Sali Escale' }
      ]},
      { code: 'KF-MH', name: 'Malem Hoddar', communes: [
        { code: 'KF-MH-MALEM', name: 'Malem Hoddar' },
        { code: 'KF-MH-DAROU', name: 'Darou Miname' },
        { code: 'KF-MH-KAHI', name: 'Kahi' }
      ]}
    ]
  },
  {
    code: 'KL',
    name: 'Kaolack',
    departments: [
      { code: 'KL-KL', name: 'Kaolack', communes: [
        { code: 'KL-KL-KAOLACKN', name: 'Kaolack Nord' },
        { code: 'KL-KL-KAOLACKS', name: 'Kaolack Sud' },
        { code: 'KL-KL-KAHONE', name: 'Kahone' },
        { code: 'KL-KL-KEUR', name: 'Keur Baka' },
        { code: 'KL-KL-NDIAFFATE', name: 'Ndiaffate' },
        { code: 'KL-KL-NDIEDIENG', name: 'Ndiédieng' }
      ]},
      { code: 'KL-GG', name: 'Guinguinéo', communes: [
        { code: 'KL-GG-GUINGUINEO', name: 'Guinguinéo' },
        { code: 'KL-GG-MBOSS', name: 'Mboss' },
        { code: 'KL-GG-KHELCOM', name: 'Khelcom – Birane' }
      ]},
      { code: 'KL-NR', name: 'Nioro du Rip', communes: [
        { code: 'KL-NR-NIORO', name: 'Nioro du Rip' },
        { code: 'KL-NR-KEUR', name: 'Keur Madiabel' },
        { code: 'KL-NR-KAYEMOR', name: 'Kayemor' },
        { code: 'KL-NR-MEDINA', name: 'Médina Sabakh' },
        { code: 'KL-NR-POROKHANE', name: 'Porokhane' },
        { code: 'KL-NR-TAIBA', name: 'Taïba Niassène' },
        { code: 'KL-NR-WACK', name: 'Wack Ngouna' }
      ]}
    ]
  },
  {
    code: 'KD',
    name: 'Kolda',
    departments: [
      { code: 'KD-KD', name: 'Kolda', communes: [
        { code: 'KD-KD-KOLDA', name: 'Kolda' },
        { code: 'KD-KD-DABO', name: 'Dabo' },
        { code: 'KD-KD-SALIKEGNE', name: 'Salikégné' }
      ]},
      { code: 'KD-MM', name: 'Médina Yoro Foulah', communes: [
        { code: 'KD-MM-MEDINA', name: 'Médina Yoro Foulah' },
        { code: 'KD-MM-PATA', name: 'Pata' },
        { code: 'KD-MM-NDORNA', name: 'Ndorna' }
      ]},
      { code: 'KD-VL', name: 'Vélingara', communes: [
        { code: 'KD-VL-VELINGARA', name: 'Vélingara' },
        { code: 'KD-VL-KOUNKANE', name: 'Kounkané' },
        { code: 'KD-VL-DIAOBE', name: 'Diaobé-Kabendou' }
      ]}
    ]
  },
  {
    code: 'LG',
    name: 'Louga',
    departments: [
      { code: 'LG-LG', name: 'Louga', communes: [
        { code: 'LG-LG-LOUGA', name: 'Louga' },
        { code: 'LG-LG-NDIAGNE', name: 'Ndiagne' },
        { code: 'LG-LG-SAKAL', name: 'Sakal' },
        { code: 'LG-LG-LEONA', name: 'Léona' }
      ]},
      { code: 'LG-KB', name: 'Kébémer', communes: [
        { code: 'LG-KB-KEBEMER', name: 'Kébémer' },
        { code: 'LG-KB-GUEOUL', name: 'Guéoul' },
        { code: 'LG-KB-DAROU', name: 'Darou Mousty' },
        { code: 'LG-KB-NDANDE', name: 'Ndande' }
      ]},
      { code: 'LG-LN', name: 'Linguère', communes: [
        { code: 'LG-LN-LINGUERE', name: 'Linguère' },
        { code: 'LG-LN-DAHRA', name: 'Dahra' },
        { code: 'LG-LN-BARKADJI', name: 'Barkédji' },
        { code: 'LG-LN-DODJI', name: 'Dodji' }
      ]}
    ]
  },
  {
    code: 'MT',
    name: 'Matam',
    departments: [
      { code: 'MT-MT', name: 'Matam', communes: [
        { code: 'MT-MT-MATAM', name: 'Matam' },
        { code: 'MT-MT-OUROSSOGUI', name: 'Ourossogui' },
        { code: 'MT-MT-THILOGNE', name: 'Thilogne' },
        { code: 'MT-MT-BOKIDIAVE', name: 'Bokidiawé' }
      ]},
      { code: 'MT-KL', name: 'Kanel', communes: [
        { code: 'MT-KL-KANEL', name: 'Kanel' },
        { code: 'MT-KL-SEMME', name: 'Semmé' },
        { code: 'MT-KL-WAOUNDE', name: 'Waoundé' },
        { code: 'MT-KL-ORKODIERE', name: 'Orkadjiéré' }
      ]},
      { code: 'MT-RN', name: 'Ranérou', communes: [
        { code: 'MT-RN-RANEROU', name: 'Ranérou' },
        { code: 'MT-RN-VELINGARA', name: 'Vélingara' }
      ]}
    ]
  },
  {
    code: 'SD',
    name: 'Sédhiou',
    departments: [
      { code: 'SD-SD', name: 'Sédhiou', communes: [
        { code: 'SD-SD-SEDHIOU', name: 'Sédhiou' },
        { code: 'SD-SD-MARSASSOUM', name: 'Marsassoum' },
        { code: 'SD-SD-DIANNAH', name: 'Diannah Malary' }
      ]},
      { code: 'SD-BK', name: 'Bounkiling', communes: [
        { code: 'SD-BK-BOUNKILING', name: 'Bounkiling' },
        { code: 'SD-BK-DIACOUNDA', name: 'Diacounda' },
        { code: 'SD-BK-DIAMBATI', name: 'Diambati' }
      ]},
      { code: 'SD-GP', name: 'Goudomp', communes: [
        { code: 'SD-GP-GOUDOMP', name: 'Goudomp' },
        { code: 'SD-GP-SAMINE', name: 'Samine' },
        { code: 'SD-GP-TANAFF', name: 'Tanaff' },
        { code: 'SD-GP-DIATTACOUNDA', name: 'Diattacounda' }
      ]}
    ]
  },
  {
    code: 'TC',
    name: 'Tambacounda',
    departments: [
      { code: 'TC-TC', name: 'Tambacounda', communes: [
        { code: 'TC-TC-TAMBACOUNDA', name: 'Tambacounda' },
        { code: 'TC-TC-KOUSSANAR', name: 'Koussanar' },
        { code: 'TC-TC-MAKACOLIBANTANG', name: 'Makacolibantang' }
      ]},
      { code: 'TC-BD', name: 'Bakel', communes: [
        { code: 'TC-BD-BAKEL', name: 'Bakel' },
        { code: 'TC-BD-DIAWARA', name: 'Diawara' },
        { code: 'TC-BD-KIDIRA', name: 'Kidira' }
      ]},
      { code: 'TC-GD', name: 'Goudiry', communes: [
        { code: 'TC-GD-GOUDIRY', name: 'Goudiry' },
        { code: 'TC-GD-KOTHIARY', name: 'Kothiary' },
        { code: 'TC-GD-KOUMPENTOUM', name: 'Koumpentoum' }
      ]}
    ]
  },
  {
    code: 'KG',
    name: 'Kédougou',
    departments: [
      { code: 'KG-KG', name: 'Kédougou', communes: [
        { code: 'KG-KG-KEDOUGOU', name: 'Kédougou' },
        { code: 'KG-KG-NINEFECHA', name: 'Ninéfécha' },
        { code: 'KG-KG-FONGOLIMBI', name: 'Fongolimbi' }
      ]},
      { code: 'KG-SR', name: 'Saraya', communes: [
        { code: 'KG-SR-SARAYA', name: 'Saraya' },
        { code: 'KG-SR-BEMBOU', name: 'Bembou' },
        { code: 'KG-SR-KHOSSANTO', name: 'Khossanto' }
      ]},
      { code: 'KG-SL', name: 'Salémata', communes: [
        { code: 'KG-SL-SALEMATA', name: 'Salémata' },
        { code: 'KG-SL-DAKATELI', name: 'Dakatéli' },
        { code: 'KG-SL-KEVOYE', name: 'Kévoye' }
      ]}
    ]
  }
];

// Liste complète des banques présentes au Sénégal
export const senegalBanks = [
  'BICIS - Banque Internationale pour le Commerce et l\'Industrie du Sénégal',
  'Société Générale Sénégal',
  'Ecobank Sénégal',
  'CBAO Groupe Attijariwafa Bank',
  'Bank Of Africa (BOA)',
  'Banque Atlantique Sénégal',
  'Orabank Sénégal',
  'Banque de Développement de Mali (BDM-SA)',
  'CNCAS - La Banque Agricole',
  'Banque Islamique du Sénégal',
  'UBA - United Bank for Africa',
  'Coris Bank International',
  'NSIA Banque',
  'CBI - Compagnie Bancaire de l\'Afrique Occidentale',
  'BHS - Banque de l\'Habitat du Sénégal',
  'BNDE - Banque Nationale pour le Développement Économique',
  'BIMAO - Banque des Institutions Mutualistes d\'Afrique de l\'Ouest',
  'Crédit du Sénégal',
  'BSIC - Banque Sahélo-Saharienne pour l\'Investissement et le Commerce',
  'ICB - International Commercial Bank',
  'Citibank Sénégal',
  'LOCAFRIQUE - Société Africaine de Crédit Automobile et Matériel'
];

// Liste complète des spécialités notariales au Sénégal
export const notaireSpecialities = [
  'Transactions Immobilières',
  'Droit Immobilier',
  'Successions & Donations',
  'Baux & Locations',
  'Droit des Affaires',
  'Droit des Sociétés',
  'Conseil Patrimonial',
  'Contentieux Foncier',
  'Actes d\'État Civil',
  'Contrats Matrimoniaux',
  'Droit de la Famille',
  'Actes Authentiques',
  'Investissements Étrangers',
  'Droit Rural',
  'Gestion de Patrimoine',
  'Fiscalité Immobilière',
  'Copropriété'
];

// Types de professionnels dans le secteur foncier
export const professionnelTypes = [
  'Notaire',
  'Agent Immobilier',
  'Géomètre Expert',
  'Avocat spécialisé en droit foncier',
  'Architecte',
  'Expert Immobilier',
  'Promoteur Immobilier',
  'Gestionnaire de Patrimoine',
  'Urbaniste',
  'Inspecteur des Impôts et Domaines',
  'Agent du Cadastre',
  'Conservateur de la Propriété Foncière'
];

// Types de demandes foncières
export const landRequestTypes = [
  'Achat de Terrain',
  'Vente de Propriété',
  'Demande de Titre Foncier',
  'Régularisation de Titre',
  'Morcellement',
  'Bail Emphytéotique',
  'Certificat de Propriété',
  'Enregistrement d\'Acte',
  'Bornage de Terrain',
  'Autorisation de Construire',
  'Certificat d\'Urbanisme',
  'Usufruit',
  'Redressement de Titre',
  'Servitude',
  'Expropriation',
  'Droit de Préemption'
];

// Types de documents fonciers
export const landDocumentTypes = [
  'Titre Foncier',
  'Acte de Vente',
  'Acte Notarié',
  'Bail',
  'Procuration',
  'Extrait Cadastral',
  'Plan de Bornage',
  'Certificat de Propriété',
  'Attestation Villageoise',
  'Certificat d\'Urbanisme',
  'Permis de Construire',
  'Attestation d\'Attribution',
  'Autorisation d\'Occuper',
  'Certificat de Conformité',
  'Quittance de Droits d\'Enregistrement',
  'Certificat de Non-Opposition et Non-Recours'
];
