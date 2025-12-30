import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  getPerfilPostulante, 
  updatePerfilPostulante,
  verificarPerfilCompleto 
} from '../../services/api';
import { toast } from 'react-hot-toast';

const MiPerfil = () => {
  // Solo llamamos al hook para mantener el contexto
  useAuth();
  
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  const [mostrarOtraUniversidad, setMostrarOtraUniversidad] = useState(false);
  const [mostrarOtraCarrera, setMostrarOtraCarrera] = useState(false);
  
  const [perfil, setPerfil] = useState({
    fecha_nacimiento: '',
    genero: '',
    estado_civil: '',
    tiene_hijos: false,
    universidad: '',
    otra_universidad: '',
    carrera: '',
    otra_carrera: '',
    anio_cursando: '',
    horas_acumular: '',
    numero_celular: '',
    cuenta_seguro: false
  });

  // Lista de universidades - usando useMemo para evitar recreación en cada render
  const universidades = useMemo(() => [
    "Universidad Mayor Real y Pontificia San Francisco Xavier de Chuquisaca",
    "Universidad Mayor de San Andrés",
    "Universidad Mayor de San Simón",
    "Universidad Autónoma Gabriel René Moreno",
    "Universidad Autónoma Tomás Frías",
    "Universidad Técnica de Oruro",
    "Universidad Autónoma Juan Misael Saracho",
    "Escuela Militar de Ingeniería",
    "Universidad Católica Boliviana San Pablo",
    "Universidad Autónoma del Beni",
    "Universidad Evangélica Boliviana",
    "Universidad Núr",
    "Universidad Privada de Santa Cruz de la Sierra",
    "Universidad Andina Simón Bolívar",
    "Universidad Nacional Siglo XX",
    "Universidad Privada del Valle",
    "Universidad Central",
    "Universidad Adventista de Bolivia",
    "Universidad Cristiana de Bolivia",
    "Universidad Nuestra Señora de la Paz",
    "Universidad Amazónica de Pando",
    "Universidad Privada Boliviana",
    "Universidad Privada Franz Tamayo",
    "Universidad Técnica Privada Cosmos",
    "Universidad Tecnológica Boliviana",
    "Universidad de la Amazonía Boliviana",
    "Universidad Tecnológica Privada de Santa Cruz",
    "Universidad Bolivia de Informática",
    "Universidad Loyola",
    "Universidad de Aquino Bolivia",
    "Universidad Empresarial de los Andes",
    "Universidad Latinoamericana",
    "Universidad Privada Abierta Latinoamericana",
    "Universidad Militar \"Mariscal Bernardino Bilbao Rioja\"",
    "Universidad de la Cordillera",
    "Universidad Privada de Oruro",
    "Universidad Privada del Chaco",
    "Universidad Salesiana de Bolivia",
    "Universidad Nacional Ecológica",
    "Universidad Nacional del Oriente",
    "Universidad Privada San Francisco de Asís",
    "Universidad Real",
    "Universidad Pedagógica Mariscal Sucre",
    "Universidad Pública de El Alto",
    "Universidad Privada Domingo Savio",
    "Universidad Privada Cumbre",
    "Universidad La Salle Bolivia",
    "Universidad Unidad",
    "Universidad Unión Bolivariana",
    "Universidad Policial \"Mariscal Antonio José de Sucre\"",
    "Universidad Simón I. Patiño",
    "Universidad Bethesda",
    "Universidad Privada de Ciencias Administrativas y Tecnológicas",
    "Universidad Indígena Aymara Túpac Katari",
    "Universidad Indígena Guaraní Apiaguaiki Tupa",
    "Universidad Indígena Quechua Casimiro Huanca",
    "Universidad para el Desarrollo y la Innovación",
    "Universidad Villa de Oropesa"
  ], []);

  // Lista de carreras - usando useMemo para evitar recreación en cada render
  const carreras = useMemo(() => [
    "Administración de Empresas",
    "Contaduría Pública / Auditoría",
    "Turismo y Hotelería",
    "Veterinaria",
    "Mecánica Industrial",
    "Mecánica Automotriz",
    "Autotrónica",
    "Electricidad Industrial",
    "Secretariado Ejecutivo",
    "Diseño Gráfico",
    "Comunicación Social / Periodismo",
    "Fisioterapia",
    "Ciencias de la Educación",
    "Ingeniería Ambiental",
    "Ingeniería Civil",
    "Ingeniería Electrónica",
    "Ingeniería de Sistemas",
    "Sistemas Informáticos",
    "Informática Industrial",
    "Arquitectura",
    "Electromecánica",
    "Contaduría General",
    "Inglés"
  ], []);

  // Usar useCallback para cargarPerfil - SIN depender de 'perfil'
  const cargarPerfil = useCallback(async () => {
    try {
      setCargando(true);
      
      // Verificar si el perfil está completo
      const verificacion = await verificarPerfilCompleto();
      setPerfilCompleto(verificacion.completo);
      
      // Cargar datos del perfil
      const response = await getPerfilPostulante();
      
      if (response.success && response.perfil) {
        // Formatear datos para los inputs
        const datos = response.perfil;
        const datosFormateados = {
          fecha_nacimiento: '',
          genero: '',
          estado_civil: '',
          tiene_hijos: false,
          universidad: '',
          otra_universidad: '',
          carrera: '',
          otra_carrera: '',
          anio_cursando: '',
          horas_acumular: '',
          numero_celular: '',
          cuenta_seguro: false
        };
        
        // Copiar todos los campos del perfil obtenido
        Object.keys(datosFormateados).forEach(key => {
          if (datos[key] !== undefined && datos[key] !== null) {
            // Si es fecha, formatear para input date
            if (key === 'fecha_nacimiento' && datos[key]) {
              const fecha = new Date(datos[key]);
              datosFormateados[key] = fecha.toISOString().split('T')[0];
            } else {
              datosFormateados[key] = datos[key];
            }
          }
        });
        
        // Verificar si necesita mostrar "otra universidad"
        if (datosFormateados.universidad && !universidades.includes(datosFormateados.universidad) && datosFormateados.universidad !== '') {
          setMostrarOtraUniversidad(true);
          // Guardar el valor actual en "otra_universidad"
          datosFormateados.otra_universidad = datosFormateados.universidad;
          datosFormateados.universidad = 'Otro';
        }

        // Verificar si necesita mostrar "otra carrera"
        if (datosFormateados.carrera && !carreras.includes(datosFormateados.carrera) && datosFormateados.carrera !== '') {
          setMostrarOtraCarrera(true);
          // Guardar el valor actual en "otra_carrera"
          datosFormateados.otra_carrera = datosFormateados.carrera;
          datosFormateados.carrera = 'Otro';
        }
        
        setPerfil(datosFormateados);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setCargando(false);
    }
  }, [universidades, carreras]); // SOLO universidades y carreras como dependencias

  // Cargar datos al montar - solo una vez
  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  // Verificar si la universidad seleccionada es "Otro"
  useEffect(() => {
    if (perfil.universidad === 'Otro') {
      setMostrarOtraUniversidad(true);
    } else {
      setMostrarOtraUniversidad(false);
      // Limpiar el campo "otra_universidad" si no se selecciona "Otro"
      if (perfil.universidad !== '') {
        setPerfil(prev => ({ ...prev, otra_universidad: '' }));
      }
    }
  }, [perfil.universidad]);

  // Verificar si la carrera seleccionada es "Otro"
  useEffect(() => {
    if (perfil.carrera === 'Otro') {
      setMostrarOtraCarrera(true);
    } else {
      setMostrarOtraCarrera(false);
      // Limpiar el campo "otra_carrera" si no se selecciona "Otro"
      if (perfil.carrera !== '') {
        setPerfil(prev => ({ ...prev, otra_carrera: '' }));
      }
    }
  }, [perfil.carrera]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPerfil({
      ...perfil,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Preparar datos para enviar
    const datosAEnviar = { ...perfil };
    
    // Si se seleccionó "Otro", usar el valor de "otra_universidad"
    if (perfil.universidad === 'Otro') {
      if (!perfil.otra_universidad.trim()) {
        toast.error('Por favor ingresa el nombre de la universidad');
        return;
      }
      datosAEnviar.universidad = perfil.otra_universidad;
    }

    // Si se seleccionó "Otro", usar el valor de "otra_carrera"
    if (perfil.carrera === 'Otro') {
      if (!perfil.otra_carrera.trim()) {
        toast.error('Por favor ingresa el nombre de la carrera');
        return;
      }
      datosAEnviar.carrera = perfil.otra_carrera;
    }
    
    // Validaciones básicas
    if (!datosAEnviar.universidad || !datosAEnviar.carrera || !datosAEnviar.numero_celular) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }
    
    try {
      setGuardando(true);
      
      const response = await updatePerfilPostulante(datosAEnviar);
      
      if (response.success) {
        toast.success('Perfil actualizado correctamente');
        setPerfilCompleto(true);
        
        // Opcional: Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        toast.error(response.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando perfil:', error);
      toast.error(error.error || 'Error al guardar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header-section">
        <h1>Mi Perfil</h1>
        <p className="subtitle">
          {perfilCompleto 
            ? 'Tu perfil está completo. Puedes actualizarlo si es necesario.' 
            : 'Completa tu información personal y académica para continuar con tu postulación.'}
        </p>
        
        {perfilCompleto && (
          <div className="alert success">
            ✅ Tu perfil está completo y listo para revisión
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="form-perfil">
        <div className="form-grid">
          {/* Sección 1: Datos Personales */}
          <div className="form-section">
            <h3>📋 Datos Personales</h3>
            
            <div className="form-group">
              <label>Fecha de Nacimiento *</label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={perfil.fecha_nacimiento}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Género *</label>
              <select
                name="genero"
                value={perfil.genero}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Estado Civil</label>
              <select
                name="estado_civil"
                value={perfil.estado_civil}
                onChange={handleChange}
              >
                <option value="">Seleccionar</option>
                <option value="Soltero/a">Soltero/a</option>
                <option value="Casado/a">Casado/a</option>
                <option value="Divorciado/a">Divorciado/a</option>
                <option value="Viudo/a">Viudo/a</option>
              </select>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="tiene_hijos"
                  checked={perfil.tiene_hijos}
                  onChange={handleChange}
                />
                ¿Tiene hijos?
              </label>
            </div>
          </div>

          {/* Sección 2: Datos Académicos */}
          <div className="form-section">
            <h3>🎓 Datos Académicos</h3>
            
            <div className="form-group">
              <label>Universidad *</label>
              <select
                name="universidad"
                value={perfil.universidad}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar una universidad</option>
                {universidades.map((uni, index) => (
                  <option key={index} value={uni}>
                    {uni}
                  </option>
                ))}
                <option value="Otro">Otro (especificar)</option>
              </select>
            </div>

            {mostrarOtraUniversidad && (
              <div className="form-group">
                <label>Especificar Universidad *</label>
                <input
                  type="text"
                  name="otra_universidad"
                  value={perfil.otra_universidad}
                  onChange={handleChange}
                  placeholder="Escribe el nombre de tu universidad"
                  required={mostrarOtraUniversidad}
                />
              </div>
            )}

            <div className="form-group">
              <label>Carrera *</label>
              <select
                name="carrera"
                value={perfil.carrera}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar una carrera</option>
                {carreras.map((carrera, index) => (
                  <option key={index} value={carrera}>
                    {carrera}
                  </option>
                ))}
                <option value="Otro">Otro (especificar)</option>
              </select>
            </div>

            {mostrarOtraCarrera && (
              <div className="form-group">
                <label>Especificar Carrera *</label>
                <input
                  type="text"
                  name="otra_carrera"
                  value={perfil.otra_carrera}
                  onChange={handleChange}
                  placeholder="Escribe el nombre de tu carrera"
                  required={mostrarOtraCarrera}
                />
              </div>
            )}

            <div className="form-group">
              <label>Año que cursa *</label>
              <select
                name="anio_cursando"
                value={perfil.anio_cursando}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar</option>
                <option value="Primer Año">Primer Año</option>
                <option value="Segundo Año">Segundo Año</option>
                <option value="Tercer Año">Tercer Año</option>
                <option value="Cuarto Año">Cuarto Año</option>
                <option value="Quinto Año">Quinto Año</option>
                <option value="Egresado">Egresado</option>
                <option value="Titulado">Titulado</option>
              </select>
            </div>

            <div className="form-group">
              <label>Horas a acumular *</label>
              <input
                type="number"
                name="horas_acumular"
                value={perfil.horas_acumular}
                onChange={handleChange}
                placeholder="Ej: 480"
                min="0"
                required
              />
              <small className="helper-text">Horas requeridas por la universidad</small>
            </div>
          </div>

          {/* Sección 3: Contacto y Seguro */}
          <div className="form-section">
            <h3>📞 Contacto y Seguro</h3>
            
            <div className="form-group">
              <label>Número de Celular *</label>
              <input
                type="tel"
                name="numero_celular"
                value={perfil.numero_celular}
                onChange={handleChange}
                placeholder="Ej: 77712345"
                pattern="[0-9]{8}"
                required
              />
              <small className="helper-text">8 dígitos sin espacios</small>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="cuenta_seguro"
                  checked={perfil.cuenta_seguro}
                  onChange={handleChange}
                />
                ¿Cuenta con seguro de salud?
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={guardando}
          >
            {guardando ? (
              <>
                <span className="spinner"></span> Guardando...
              </>
            ) : perfilCompleto ? 'Actualizar Perfil' : 'Guardar y Continuar'}
          </button>
          
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default MiPerfil;
