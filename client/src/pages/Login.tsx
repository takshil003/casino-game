import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice'

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`

const LoginForm = styled.form`
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background: #2c3e50;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`

const Title = styled.h1`
  color: white;
  text-align: center;
  margin-bottom: 20px;
`

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: none;
  border-radius: 5px;
  background: #34495e;
  color: white;
  font-size: 16px;

  &::placeholder {
    color: #95a5a6;
  }
`

const Button = styled.button`
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: #3498db;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  color: #e74c3c;
  text-align: center;
  margin-bottom: 15px;
`

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    dispatch(loginStart())

    try {
      // TODO: Replace with actual API call
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      dispatch(loginSuccess(data))
      navigate('/game')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      dispatch(loginFailure(errorMessage))
      setError(errorMessage)
    }
  }

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <Title>Login to Play</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Button type="submit">Login</Button>
      </LoginForm>
    </LoginContainer>
  )
}

export default Login 