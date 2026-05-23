import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin test account
  const adminPassword = await bcrypt.hash('johndoe123', 12);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: { role: 'ADMIN', password: adminPassword },
    create: {
      email: 'john@doe.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
      country: 'España',
    },
  });

  console.log('Admin user seeded');

  // Create default tags for the admin user
  const adminUser = await prisma.user.findUnique({ where: { email: 'john@doe.com' } });
  if (adminUser) {
    const defaultTags = [
      'Romana', 'Griega', 'Medieval', 'Española', 'Europea',
      'Americana', 'Asiática', 'Oro', 'Plata', 'Bronce',
      'Cobre', 'Euro', 'Billetes', 'Conmemorativa', 'Colonial',
    ];

    for (const tagName of defaultTags) {
      await prisma.tag.upsert({
        where: { name_userId: { name: tagName, userId: adminUser.id } },
        update: {},
        create: {
          name: tagName,
          userId: adminUser.id,
        },
      });
    }
    console.log('Default tags seeded');
  }

  // Seed sample news articles
  if (adminUser) {
    const sampleNews = [
      {
        title: 'Nuevo récord en subasta: denario romano vendido por 1.2 millones',
        summary: 'Un raro denario de Bruto, acuñado tras el asesinato de Julio César (EID MAR), alcanza cifras históricas en subasta internacional.',
        content: 'Un excepcional denario de plata acuñado por Marco Junio Bruto en el año 42 a.C., conocido como "EID MAR" (Idus de Marzo), ha sido vendido en una prestigiosa casa de subastas por la cifra récord de 1.2 millones de euros.\n\nLa moneda conmemora el asesinato de Julio César y es considerada una de las piezas más icónicas de la numismática antigua. Solo se conocen unas 80 piezas de este tipo, de las cuales menos de 3 están en manos privadas.\n\nEl comprador, un coleccionista privado europeo que prefiere mantener el anonimato, describió la pieza como "el objeto histórico más significativo que he tenido el privilegio de adquirir".\n\nEste resultado confirma la tendencia alcista en el mercado de monedas antiguas, que ha experimentado un crecimiento sostenido del 15% anual durante la última década.',
        imageUrl: '/images/news/eid_mar_denarius.jpg',
        category: 'subastas',
        published: true,
      },
      {
        title: 'Hallazgo arqueológico: tesoro visigodo descubierto en Toledo',
        summary: 'Un equipo de arqueólogos ha descubierto un conjunto de más de 200 monedas de oro visigodas del siglo VII en las afueras de Toledo.',
        content: 'Un equipo de arqueólogos de la Universidad Complutense de Madrid ha descubierto un espectacular tesoro compuesto por más de 200 trientes de oro visigodos en una excavación realizada en las cercanías de Toledo.\n\nLas monedas, datadas entre los reinados de Recaredo I y Suintila (586-631 d.C.), presentan un estado de conservación excepcional. Muchas de ellas muestran inscripciones legibles y retratos detallados de los monarcas.\n\nLa Dra. María López, directora de la excavación, señaló que "este hallazgo es uno de los más importantes de numismática visigoda en las últimas décadas y nos ofrece información invaluable sobre la economía y el comercio en la Hispania visigoda".\n\nLas piezas serán restauradas y estudiadas antes de ser expuestas en el Museo Arqueológico Nacional de Madrid.',
        imageUrl: '/images/news/visigothic_gold_coins.jpg',
        category: 'descubrimiento',
        published: true,
      },
      {
        title: 'La FNMT lanza nueva serie conmemorativa del Camino de Santiago',
        summary: 'La Fábrica Nacional de Moneda y Timbre presenta una colección de 8 monedas conmemorativas dedicadas a las rutas del Camino de Santiago.',
        content: 'La Fábrica Nacional de Moneda y Timbre (FNMT) ha presentado su nueva serie numismática dedicada al Camino de Santiago, compuesta por 8 monedas que representan las principales rutas jacobeas.\n\nLa colección incluye piezas de 10€ y 50€ acuñadas en plata de ley y oro respectivamente, con diseños que representan monumentos emblemáticos de cada ruta: el Camino Francés, el Camino del Norte, la Vía de la Plata, el Camino Primitivo, el Camino Portugués, el Camino Inglés, la Ruta del Salvador y el Camino de Finisterre.\n\nCada moneda tiene una tirada limitada de 5.000 ejemplares y ya está disponible para su adquisición a través de la tienda online de la FNMT y en establecimientos numismáticos autorizados.',
        imageUrl: '/images/news/camino_santiago_coins.jpg',
        category: 'mercado',
        published: true,
      },
      {
        title: 'Inteligencia artificial revoluciona la autenticación de monedas',
        summary: 'Nuevos sistemas basados en IA permiten detectar falsificaciones con una precisión del 99.7%, transformando el sector numismático.',
        content: 'Los avances en inteligencia artificial están transformando radicalmente la forma en que se autentican las monedas antiguas y modernas. Varias empresas tecnológicas han desarrollado sistemas basados en aprendizaje profundo capaces de analizar microscópicamente la superficie de las monedas.\n\nEstos sistemas, entrenados con millones de imágenes de monedas auténticas y falsas, pueden detectar irregularidades en el peso, la composición metálica, los patrones de desgaste y las microestructuras del relieve que son imperceptibles para el ojo humano.\n\nSegún los últimos estudios publicados, la tasa de detección de falsificaciones supera el 99.7%, lo que supone un avance significativo respecto a los métodos tradicionales.\n\nPlataformas como NumisCloud ya están integrando estas capacidades de IA para ayudar a los coleccionistas a identificar y catalogar sus piezas de forma más precisa.',
        imageUrl: '/images/news/ai_coin_authentication.jpg',
        category: 'tecnologia',
        published: true,
      },
    ];

    for (const news of sampleNews) {
      const existing = await prisma.newsArticle.findFirst({
        where: { title: news.title, authorId: adminUser.id },
      });
      if (!existing) {
        await prisma.newsArticle.create({
          data: { ...news, authorId: adminUser.id },
        });
      } else if (!existing.imageUrl && news.imageUrl) {
        // Update existing articles with cover images
        await prisma.newsArticle.update({
          where: { id: existing.id },
          data: { imageUrl: news.imageUrl },
        });
      }
    }
    console.log('Sample news seeded');

    // Seed sample events
    const sampleEvents = [
      {
        title: 'Salón Internacional de Numismática de Madrid',
        description: 'El mayor evento numismático de España con más de 150 expositores internacionales, subastas en vivo, conferencias y talleres de identificación.',
        location: 'IFEMA - Feria de Madrid',
        city: 'Madrid',
        country: 'España',
        startDate: new Date('2026-10-16'),
        endDate: new Date('2026-10-18'),
        organizer: 'Asociación Numismática Española',
        featured: true,
      },
      {
        title: 'Convención Nacional de Coleccionistas',
        description: 'Encuentro anual de la comunidad numismática española con intercambio de piezas, tasaciones gratuitas y exposiciones temáticas.',
        location: 'Palacio de Congresos',
        city: 'Barcelona',
        country: 'España',
        startDate: new Date('2026-11-07'),
        endDate: new Date('2026-11-09'),
        organizer: 'Federación de Coleccionistas',
        featured: true,
      },
      {
        title: 'World Money Fair 2027',
        description: 'La feria numismática más importante del mundo. Casas de moneda de más de 50 países presentan sus novedades.',
        location: 'Estrel Convention Center',
        city: 'Berlín',
        country: 'Alemania',
        startDate: new Date('2027-01-29'),
        endDate: new Date('2027-01-31'),
        url: 'https://www.worldmoneyfair.de',
        organizer: 'World Money Fair GmbH',
        featured: true,
      },
      {
        title: 'Feria Numismática de Sevilla',
        description: 'Feria regional con especial atención a moneda ibérica, árabe y colonial americana. Tasaciones y certificaciones incluidas.',
        location: 'Hotel Meliá Sevilla',
        city: 'Sevilla',
        country: 'España',
        startDate: new Date('2026-09-20'),
        endDate: new Date('2026-09-21'),
        organizer: 'Asociación Numismática de Sevilla',
        featured: false,
      },
      {
        title: 'Subasta Numismática de Primavera - Áureo & Calicó',
        description: 'Subasta presencial y online con más de 2.000 lotes de monedas españolas, romanas, griegas y medievales.',
        location: 'Hotel Palace',
        city: 'Madrid',
        country: 'España',
        startDate: new Date('2026-06-12'),
        endDate: new Date('2026-06-13'),
        url: 'https://www.aureo.com',
        organizer: 'Áureo & Calicó',
        featured: false,
      },
    ];

    for (const event of sampleEvents) {
      const existing = await prisma.event.findFirst({
        where: { title: event.title },
      });
      if (!existing) {
        await prisma.event.create({ data: event });
      }
    }
    console.log('Sample events seeded');
  }

  // Seed forum categories
  const forumCategories = [
    { name: 'Normas y funcionamiento', slug: 'normas-y-funcionamiento', description: 'Normas generales, comportamiento, políticas y funcionamiento de NumisCloud', icon: '📋', sortOrder: 0 },
    { name: 'Monedas antiguas', slug: 'monedas-antiguas', description: 'Monedas griegas, fenicias, íberas y de otras civilizaciones antiguas', sortOrder: 1 },
    { name: 'Monedas romanas', slug: 'monedas-romanas', description: 'República, Imperio, monedas provinciales y tardorromanas', sortOrder: 2 },
    { name: 'Monedas medievales', slug: 'monedas-medievales', description: 'Visigodas, árabes, reinos cristianos peninsulares y europeas', sortOrder: 3 },
    { name: 'Moneda española', slug: 'moneda-espanola', description: 'Desde los Reyes Católicos hasta la peseta y la España contemporánea', sortOrder: 4 },
    { name: 'Euros', slug: 'euros', description: 'Euros corrientes, conmemorativos, errores y variantes', sortOrder: 5 },
    { name: 'Billetes', slug: 'billetes', description: 'Notafilia: billetes españoles, europeos y del mundo', sortOrder: 6 },
    { name: 'Medallas y condecoraciones', slug: 'medallas-y-condecoraciones', description: 'Medallas militares, civiles, conmemorativas y exonumia', sortOrder: 7 },
    { name: 'Identificación de piezas', slug: 'identificacion-de-piezas', description: '¿No sabes qué moneda tienes? La comunidad te ayuda a identificarla', sortOrder: 8 },
    { name: 'Valoraciones orientativas', slug: 'valoraciones-orientativas', description: 'Consulta el valor aproximado de tus piezas', sortOrder: 9 },
    { name: 'Dudas de conservación', slug: 'dudas-de-conservacion', description: 'Limpieza, almacenamiento, restauración y clasificación de estado', sortOrder: 10 },
    { name: 'Ferias y eventos', slug: 'ferias-y-eventos', description: 'Información sobre ferias, subastas, exposiciones y quedadas', sortOrder: 11 },
    { name: 'Piezas robadas o sospechosas', slug: 'piezas-robadas-o-sospechosas', description: 'Alertas sobre monedas robadas, falsificaciones y fraudes', sortOrder: 12 },
    { name: 'Noticias numismáticas', slug: 'noticias-numismaticas', description: 'Actualidad del mundo numismático, hallazgos y publicaciones', sortOrder: 13 },
    { name: 'Compra/venta segura', slug: 'compra-venta-segura', description: 'Consejos para comprar y vender monedas de forma segura', sortOrder: 14 },
  ];

  for (const cat of forumCategories) {
    await prisma.forumCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: cat,
    });
  }
  console.log('Forum categories seeded');

  // Seed pinned welcome topics for each forum category
  if (adminUser) {
    const welcomeTopics: Record<string, { title: string; content: string }> = {
      'normas-y-funcionamiento': {
        title: '📋 Normas generales de NumisCloud',
        content: `Bienvenido/a a NumisCloud. Para mantener una comunidad sana y profesional, es imprescindible respetar las siguientes normas:\n\n**1. Respeto y educación**\nTrata a todos los miembros con cortesía. No se toleran insultos, amenazas ni discriminación de ningún tipo.\n\n**2. Contenido relevante**\nPublica únicamente contenido relacionado con la numismática, coleccionismo y temas afines. No se permite spam ni publicidad no autorizada.\n\n**3. Autenticidad y veracidad**\nNo publiques información falsa sobre piezas, valoraciones o autenticidad. Si no estás seguro, indícalo claramente.\n\n**4. Ventas y transacciones**\nNumisCloud no se responsabiliza de transacciones entre usuarios. Usa siempre métodos seguros y documenta todo.\n\n**5. Derechos de imagen**\nNo publiques imágenes de terceros sin permiso. Las fotografías deben ser propias o de dominio público.\n\n**6. Denuncias y moderación**\nSi detectas una infracción, usa el sistema de reportes. No hagas justicia por tu cuenta.\n\n**7. Sanciones**\n- 1ª infracción: Aviso\n- 2ª infracción: Suspensión temporal (7 días)\n- 3ª infracción: Expulsión definitiva\n\nEl equipo de moderación se reserva el derecho de aplicar sanciones según la gravedad.\n\nContacto: info@numiscloud.es`,
      },
      'monedas-antiguas': {
        title: '🏛️ Bienvenidos al apartado de Monedas Antiguas',
        content: `Este apartado está dedicado a las monedas de civilizaciones antiguas: griegas, fenicias, íberas, celtas, cartaginesas y demás pueblos de la Antigüedad.\n\n**¿Qué puedes publicar aquí?**\n- Monedas griegas (dracmas, tetradracmas, óbolos...)\n- Monedas íberas y celtíberas\n- Monedas fenicias y cartaginesas\n- Otras acuñaciones pre-romanas\n\n**Formato recomendado:**\n- Título descriptivo (tipo, pueblo/ceca, siglo)\n- Fotografías claras de anverso y reverso\n- Peso, diámetro y metal si lo conoces\n- Referencias de catálogo (SNG, CNH, ACIP...)\n\n**Normas específicas:**\n- Indica siempre la procedencia de la pieza\n- No publiques piezas de procedencia dudosa\n- Respeta la legislación sobre patrimonio arqueológico`,
      },
      'monedas-romanas': {
        title: '🦅 Bienvenidos al apartado de Monedas Romanas',
        content: `Espacio dedicado a la numismática romana en todas sus etapas: República, Imperio, monedas provinciales y tardorromanas.\n\n**¿Qué puedes publicar aquí?**\n- Denarios, sestercios, áureos, antoninianos...\n- Monedas republicanas y de guerras civiles\n- Monedas imperiales (de Augusto a Rómulo Augústulo)\n- Provinciales y coloniales romanas\n\n**Formato recomendado:**\n- Título: Denominación + Emperador/magistrado + Fecha\n- Fotografías de anverso y reverso\n- Peso, diámetro y eje de cuños\n- Referencias: RIC, RRC, RSC, RPC...\n\n**Normas específicas:**\n- Indica la procedencia de la pieza\n- Especifica si es original, réplica o dudosa`,
      },
      'monedas-medievales': {
        title: '⚔️ Bienvenidos al apartado de Monedas Medievales',
        content: `Sección dedicada a la numismática medieval: visigodas, árabes, reinos cristianos peninsulares y monedas europeas medievales.\n\n**¿Qué puedes publicar aquí?**\n- Monedas visigodas (tremises, etc.)\n- Monedas árabes hispanas (dirhams, dinares...)\n- Monedas de reinos cristianos (Castilla, Aragón, Navarra...)\n- Monedas medievales europeas\n\n**Formato recomendado:**\n- Título descriptivo con reino, tipo y periodo\n- Fotos claras con escala\n- Peso, diámetro, metal\n- Referencias de catálogo`,
      },
      'moneda-espanola': {
        title: '🇪🇸 Bienvenidos al apartado de Moneda Española',
        content: `Espacio para la moneda española desde los Reyes Católicos hasta nuestros días: reales, escudos, pesetas y moneda contemporánea.\n\n**¿Qué puedes publicar aquí?**\n- Monedas de los Reyes Católicos\n- Casa de Austria (reales de a 8, escudos...)\n- Casa de Borbón\n- Sistema decimal: pesetas y céntimos\n- Moneda de la Guerra Civil\n\n**Formato recomendado:**\n- Título: Denominación + Monarca + Año + Ceca\n- Fotografías de calidad\n- Peso, diámetro\n- Referencia: Cayón, Calicó, etc.`,
      },
      'euros': {
        title: '💶 Bienvenidos al apartado de Euros',
        content: `Sección dedicada a las monedas euro: corrientes, conmemorativas, errores, variantes y sets especiales.\n\n**¿Qué puedes publicar aquí?**\n- Euros corrientes de todos los países\n- Euros conmemorativos (2€ CC)\n- Errores y variantes\n- Sets de calidad BU/Proof\n- Monedas de coleccionista (10€, 20€, 50€...)\n\n**Formato recomendado:**\n- País, año, denominación\n- Fotos de anverso y reverso\n- Si es error: describir detalladamente`,
      },
      'billetes': {
        title: '💵 Bienvenidos al apartado de Billetes',
        content: `Espacio dedicado a la notafilia: billetes españoles, europeos y del mundo.\n\n**¿Qué puedes publicar aquí?**\n- Billetes españoles (pesetas, guerra civil...)\n- Billetes de euro\n- Billetes del mundo\n- Billetes de necesidad y locales\n\n**Formato recomendado:**\n- País, denominación, año, serie\n- Fotografía de anverso y reverso\n- Estado de conservación\n- Referencia: Pick, Edifil...`,
      },
      'medallas-y-condecoraciones': {
        title: '🏅 Bienvenidos al apartado de Medallas y Condecoraciones',
        content: `Sección para medallas militares, civiles, conmemorativas, religiosas y toda la exonumia.\n\n**¿Qué puedes publicar aquí?**\n- Medallas conmemorativas\n- Condecoraciones militares y civiles\n- Medallas religiosas\n- Fichas, jetones y tokens\n\n**Formato recomendado:**\n- Descripción detallada del motivo\n- Material, peso y dimensiones\n- Época y origen si se conoce`,
      },
      'identificacion-de-piezas': {
        title: '🔍 Bienvenidos al apartado de Identificación de Piezas',
        content: `¿Tienes una moneda y no sabes qué es? ¡La comunidad te ayuda a identificarla!\n\n**¿Cómo pedir ayuda?**\n- Sube fotografías claras de anverso y reverso\n- Indica el tamaño aproximado y el metal (si lo sabes)\n- Describe dónde la encontraste o cómo la obtuviste\n- Indica si tiene alguna inscripción legible\n\n**Consejos para buenas fotos:**\n- Luz natural o difusa\n- Fondo neutro\n- Incluir escala (regla o moneda conocida)\n- Fotografiar ambas caras`,
      },
      'valoraciones-orientativas': {
        title: '💰 Bienvenidos al apartado de Valoraciones Orientativas',
        content: `Consulta aquí el valor aproximado de tus piezas con la ayuda de la comunidad.\n\n**Importante:**\n- Las valoraciones son ORIENTATIVAS, no vinculantes\n- Incluye siempre fotos de calidad\n- Indica el peso, diámetro y estado de conservación\n- Menciona si la pieza está certificada\n\n**Factores que influyen en el valor:**\n- Estado de conservación\n- Rareza y tirada\n- Demanda del mercado\n- Certificación (NGC, PCGS, etc.)`,
      },
      'dudas-de-conservacion': {
        title: '🧹 Bienvenidos al apartado de Dudas de Conservación',
        content: `Espacio para resolver dudas sobre limpieza, almacenamiento, restauración y clasificación del estado de conservación.\n\n**Temas habituales:**\n- ¿Cómo limpiar una moneda? (spoiler: generalmente NO debes)\n- Almacenamiento correcto: cápsulas, álbumes, bandejas\n- Clasificación de conservación: BC, MBC, EBC, SC...\n- Pátinas: conservar o eliminar\n\n**Regla de oro:**\nAntes de limpiar una moneda, pregunta aquí. Una limpieza incorrecta puede destruir el valor de una pieza.`,
      },
      'ferias-y-eventos': {
        title: '📅 Bienvenidos al apartado de Ferias y Eventos',
        content: `Información sobre ferias numismáticas, subastas, exposiciones, quedadas y otros eventos del sector.\n\n**¿Qué puedes publicar aquí?**\n- Anuncios de ferias y convenciones\n- Fechas de subastas\n- Exposiciones numismáticas\n- Quedadas de coleccionistas\n- Reseñas de eventos pasados\n\n**Formato recomendado:**\n- Nombre del evento\n- Fecha y lugar\n- Enlace a la web oficial\n- Tu experiencia si ya lo conoces`,
      },
      'piezas-robadas-o-sospechosas': {
        title: '🚨 Bienvenidos al apartado de Piezas Robadas o Sospechosas',
        content: `Espacio para alertar sobre monedas robadas, falsificaciones conocidas y posibles fraudes.\n\n**¿Qué puedes publicar aquí?**\n- Alertas de robos con descripción detallada\n- Falsificaciones detectadas\n- Vendedores sospechosos\n- Piezas con procedencia dudosa\n\n**Importante:**\n- Aporta siempre pruebas o indicios fundamentados\n- No hagas acusaciones sin evidencia\n- Si tienes información de un robo, contacta también con las autoridades\n- Usa la función de denuncia de la plataforma`,
      },
      'noticias-numismaticas': {
        title: '📰 Bienvenidos al apartado de Noticias Numismáticas',
        content: `Sección para compartir y debatir sobre la actualidad del mundo numismático.\n\n**¿Qué puedes publicar aquí?**\n- Nuevas emisiones y acuñaciones\n- Hallazgos arqueológicos\n- Resultados de subastas destacadas\n- Publicaciones y catálogos nuevos\n- Cambios legislativos relevantes\n\n**Formato recomendado:**\n- Título claro y descriptivo\n- Enlace a la fuente original\n- Tu análisis u opinión`,
      },
      'compra-venta-segura': {
        title: '🛡️ Bienvenidos al apartado de Compra/Venta Segura',
        content: `Consejos y experiencias sobre cómo comprar y vender monedas de forma segura.\n\n**Temas habituales:**\n- Plataformas fiables para comprar\n- Cómo identificar vendedores de confianza\n- Métodos de pago seguros\n- Envíos y embalajes\n- Derechos del comprador\n\n**Importante:**\n- NumisCloud NO es una plataforma de compraventa\n- No se permiten anuncios de venta directa\n- Comparte experiencias y consejos, no ofertas`,
      },
    };

    for (const [slug, topic] of Object.entries(welcomeTopics)) {
      const category = await prisma.forumCategory.findUnique({ where: { slug } });
      if (category) {
        const existing = await prisma.forumTopic.findFirst({
          where: { categoryId: category.id, pinned: true, isOfficial: true },
        });
        if (!existing) {
          await prisma.forumTopic.create({
            data: {
              title: topic.title,
              content: topic.content,
              categoryId: category.id,
              authorId: adminUser.id,
              pinned: true,
              isOfficial: true,
              closed: false,
            },
          });
        }
      }
    }
    console.log('Pinned welcome topics seeded');
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
