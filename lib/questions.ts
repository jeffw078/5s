export const SENSES = [
  {id:1,name:'Seiri',label:'Utilização',description:'Somente o necessário, no lugar certo.',color:'#91b72c'},
  {id:2,name:'Seiton',label:'Organização',description:'Um lugar para cada coisa.',color:'#319c91'},
  {id:3,name:'Seiso',label:'Limpeza',description:'Cuidar do ambiente é cuidar de todos.',color:'#5b8bd3'},
  {id:4,name:'Seiketsu',label:'Saúde e padronização',description:'Condições seguras todos os dias.',color:'#a780cc'},
  {id:5,name:'Shitsuke',label:'Disciplina',description:'Boas práticas que se tornam hábito.',color:'#dca14b'},
] as const;
const texts:Record<number,string[]>={
  1:[
    'Todos os objetos, equipamentos, materiais ou ferramentas que estão no local de trabalho são necessários (sem excesso de equipamentos)?',
    'Objetos pessoais são encontrados na área de trabalho?',
    'Os recursos água e energia elétrica são utilizados adequadamente, sem desperdícios aparentes?',
    'Os objetos de trabalho estão dispostos de acordo com a frequência de uso?'],
  2:[
    'O colaborador trabalha de forma organizada, não deixando objetos em locais inapropriados?',
    'As latas de lixo estão identificadas e pintadas de acordo com a legislação?',
    'Armários e gaveteiros estão identificados?',
    'Os arquivos estão organizados e claramente identificados?',
    'Os materiais de trabalho estão padronizados e bem localizados, facilitando o seu acesso, de maneira que o fluxo de trabalho possa ser facilmente entendido?',
    'Todos os equipamentos, bancadas, armários e mesas de trabalho estão organizados?'],
  3:[
    'As cadeiras, armários, mesas, bancadas, equipamentos, ferramentas e objetos encontram-se limpos e em bom estado de conservação?',
    'A documentação está limpa, sem rasgos e protegida de forma que garanta a sua integridade?',
    'Os banheiros estão limpos e em boas condições de uso, bem como corredores e áreas de uso comum?',
    'Há disponíveis no banheiro lixeiras, porta papel toalha, porta papel higiênico e saboneteira? Estão em bom estado de conservação?',
    'O piso é mantido limpo e livre de resíduos?',
    'As lixeiras estão sendo usadas de forma adequada? Ocorre a separação correta dos resíduos?'],
  4:[
    'Extintores, alarmes de incêndio e portas de emergência estão desobstruídos?',
    'Tomadas elétricas, interruptores e extensões elétricas estão em estado adequado para utilização?',
    'Os banheiros estão limpos e em boas condições de uso, bem como corredores e áreas de uso comum?',
    'Existe uma área determinada para alimentos? Se sim, está sendo utilizada de forma higiênica?'],
  5:[
    'O setor está engajado para manter o 5S?',
    'As não conformidades apontadas nas avaliações anteriores estão sendo trabalhadas com ações que garantam a eficácia na busca do aperfeiçoamento contínuo do processo?',
    'De modo geral, o setor passa a impressão de ser um ambiente disciplinado?']
};
export const QUESTIONS=Object.entries(texts).flatMap(([sense,questions])=>questions.map((text,i)=>({id:`s${sense}q${i+1}`,sense:Number(sense),order:i+1,text})));
export const SCORE_OPTIONS=[0,25,50,75,100];
